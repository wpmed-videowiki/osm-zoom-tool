import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  Stack,
  Toolbar,
  Typography,
  Container,
  Tooltip,
  MenuItem,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { popupCenter } from "../utils/popupTools";
import { logoutPlatform } from "../actions/auth";
import Link from "next/link";

const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);

  const { data: session, update } = useSession();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const logout = async (provider) => {
    await logoutPlatform(provider);
    await update();
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "white" }}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: { md: "flex" },
            justifyContent: { md: "space-between" },
            mx: "auto",
          }}
        >
          <Stack
            sx={{
              display: { xs: "none", md: "flex" },
            }}
          >
            <Link href="/">
              <Stack direction="row" spacing={1} alignItems="center">
                <img src="/logo.png" width={200} height={57} />
              </Stack>
            </Link>
          </Stack>

          <Box sx={{ flexGrow: 0 }}>
            <Stack flexDirection="row" alignItems="center">
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar>{session?.user.name?.slice(0, 1)}</Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {session?.user.wikimediaId ? (
                  <MenuItem onClick={() => logout("wikimedia")}>
                    <Typography textAlign="center">Wikimedia Logout</Typography>
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() =>
                      popupCenter("/login?provider=wikimedia", "Login")
                    }
                  >
                    <Typography textAlign="center">Wikimedia Login</Typography>
                  </MenuItem>
                )}
              </Menu>
            </Stack>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
