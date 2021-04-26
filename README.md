# Empty-project-with-gulp

## Instalation 

1. First of all, you have to have installed [Node.js](https://nodejs.org).
2. Then copy these files into your dirrectory.
3. Run in console, where you put these files, 'npm i' to install node_modules.
```cmd
npm i
```

## Usage 

To start work, run 'gulp'.
```cmd
gulp
```
If project is ready, run 'gulp build' it will minify and check with linter for errors.

##Eslint

I use [eslint](https://eslint.org) for linter(config for linter you can find and modify in .eslintrc.json file).

At any time, run 'gulp linter' to check for errors with linter
```cmd
gulp linter
```

##Prettier

Prettier config can be found in .prettierrc.json file.

##Babel

Babel config can be found in .babelrc.json file.

## License
[MIT](https://choosealicense.com/licenses/mit/)
