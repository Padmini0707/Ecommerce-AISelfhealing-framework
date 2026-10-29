#use from where playwright dependecies are maintained in dockerhub
FROM  mcr.microsoft.com/playwright:v1.64.1-noble
#make the /app as working directory inside the container
WORKDIR /app
#copy where exactly dependencies exists
COPY package.json package-lock.json ./
#run all those depedenices by using the file you copied
RUN npm ci
#cop all the folder accepts .dockerignore one
COPY . .
#Run this command in conatiner
CMD ["npx","playwright","test","--project=chromium"]