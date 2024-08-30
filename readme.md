# Music Store APIs

This is the music-store apis backend project based on Node.js and Express

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them:

- Node.js
- NPM (comes with Node.js)
- Git

### Installing

A step by step series of examples that tell you how to get a development env running.

1. Clone the repo

```bash
git clone https://github.com/netidentity/music-store-apis.git
```

2. Navigate to project directory

```bash
cd music-store-apis
```

3. Install dependencies

```bash
npm install
```

4. Start the application

```bash
npm start
```

Now you should be able to see the application running at localhost:3000 in your browser.

## Deploying on a Linux Server with Nginx

Here are the steps for deploying the application on a Linux Server with Nginx as a reverse proxy.

### Prerequisites

- A Linux Server with Node.js, NPM and Nginx installed.
- Git (optional)

### Steps

1. Clone your project into your server or you can upload your project files manually.

```bash
git clone https://github.com/netidentity/music-store-apis.git
```

2. Navigate to your project directory.

```bash
cd music-store-apis
```

3. Install the necessary npm packages.

```bash
npm install --production
```

4. Run your application (consider using a process manager like pm2 to keep your application running).

```bash
npm start
```

5. Configure Nginx to proxy requests to your Node.js application.
   Open the default Nginx config file:

```bash
sudo nano /etc/nginx/sites-available/default
```

Then add the following configuration inside the server block:

```nginx
location / {
    proxy_pass http://localhost:3000; #the port your app runs on
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

6. Restart Nginx

```bash
sudo service nginx restart
```

Now, your Node.js application should be accessible via your server's IP address or domain name (if configured).
