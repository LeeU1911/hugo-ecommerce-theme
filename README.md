# Hugo e-commerce theme
[![Build Status](https://travis-ci.org/LeeU1911/dalafarm.svg?branch=master)](https://travis-ci.org/LeeU1911/dalafarm)

## Open-sourced from DalaFarm website at:
http://dalafarm.vn

## Install 

You must have [hugo](https://gohugo.io/getting-started/installing/) and [gulp](https://github.com/gulpjs/gulp/blob/v3.9.1/docs/getting-started.md) installed.
Create a new folder and enter on it.

```
hugo new site .
git init
git submodule add https://github.com/LeeU1911/hugo-ecommerce-theme.git themes/hugo-ecommerce-theme
cp ./themes/hugo-ecommerce-theme/exampleSite/* .
sudo npm install gulp gulp-concat gulp-rename gulp-uglify gulp-less gulp-minify-css gulp-imagemin gulp-gzip gulp-htmlmin
gulp
hugo server
```



