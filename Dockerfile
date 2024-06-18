FROM node:20.12.2
WORKDIR /app

RUN apt update -y  
RUN apt install -y chromium ffmpeg 

# copy package.json and package-lock.json   
COPY package*.json ./
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install

# copy the rest of the files
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]