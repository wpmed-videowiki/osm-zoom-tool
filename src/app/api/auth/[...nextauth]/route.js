import NextAuth from "next-auth";
import WikimediaProvider from "next-auth/providers/wikimedia";
import connectDB from "../../lib/connectDB";
import UserModel from "../../../models/User";

const providers = [
  WikimediaProvider({
    token: "https://commons.wikimedia.org/w/rest.php/oauth2/access_token",
    userinfo:
      "https://commons.wikimedia.org/w/rest.php/oauth2/resource/profile",
    authorization: {
      url: "https://commons.wikimedia.org/w/rest.php/oauth2/authorize",
    },
    clientId: process.env.MEDIAWIKI_CONSUMER_KEY,
    clientSecret: process.env.MEDIAWIKI_CONSUMER_SECRET,
    name: "Commons",
    id: "wikimedia",
  }),
];
const handler = async (req, res) => {
  const appUserId = req.cookies.get("app-user-id")?.value;

  return await NextAuth(req, res, {
    providers,
    callbacks: {
      async signIn(data) {
        await connectDB();
        // update user
        try {
          if (appUserId) {
            const provider = data.account.provider;
            let update = {
              [`${provider}Id`]: data.account.providerAccountId,
              [`${provider}Token`]: data.account.access_token,
              [`${provider}RefreshToken`]: data.account.refresh_token,
              [`${provider}TokenExpiresAt`]: data.account.expires_at * 1000,
              [`${provider}Profile`]: data.profile,
            };
            await UserModel.findByIdAndUpdate(appUserId, {
              $set: update,
            });
          }
        } catch (err) {
          console.error(err);
        }
        return true;
      },
      async jwt({ token, account }) {
        await connectDB();
        const user = await UserModel.findById(appUserId);
        if (account) {
          token = Object.assign({}, token, {
            userId: user._id,
          });
        }
        return token;
      },
      async session({ session, token }) {
        await connectDB();
        let user = await UserModel.findById(appUserId);
        // check tokens expiration
        const update = {};
        if (
          user.wikimediaId &&
          (!user.wikimediaTokenExpiresAt ||
            user.wikimediaTokenExpiresAt < Date.now())
        ) {
          update.wikimediaId = null;
          update.wikimediaProfile = null;
          update.wikimediaToken = null;
          update.wikimediaRefreshToken = null;
          update.wikimediaTokenExpiresAt = null;
        }
        if (Object.keys(update).length) {
          user = await UserModel.findByIdAndUpdate(
            appUserId,
            {
              $set: update,
            },
            { new: true }
          );
        }
        if (session) {
          session = Object.assign({}, session, {
            user: {
              _id: user._id,
              mdwikiId: user.mdwikiId,
              wikimediaId: user.wikimediaId,
              nccommonsId: user.nccommonsId,
              wikimediaProfile: user.wikimediaProfile,
              mdwikiProfile: user.mdwikiProfile,
              nccommonsProfile: user.nccommonsProfile,
            },
          });
        }
        return session;
      },
    },
  });
};

export { handler as GET, handler as POST };
