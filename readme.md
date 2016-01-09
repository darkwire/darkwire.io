# FattyChat

FattyChat is the simplest way to chat online anonymously.

### Installation

Install dependencies

    npm install

You need Gulp installed globally:

    npm install -g gulp
    gulp watch

Run the app (nodemon is nice to have)

    npm install -g nodemon
    nodemon --watch src index.js -e css,js,mustache

FattyChat is now running on `http://localhost:3000`

### Deployment

Build source

    gulp build