# Dashboard Application for Internal Use

This project provides a dashboard for employees and owners to check on sales, inventory, and other business metrics.

## Important Note: Using Yarn

This project uses **Yarn** as the package manager instead of npm. Please use Yarn for all commands to ensure consistent dependency resolution and to maintain security fixes through the resolutions field in package.json.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Deployment

When deploying this application, always use Yarn for dependency installation and builds:

```bash
# Install dependencies
yarn install

# Build for production
yarn build
```

## Development Guidelines

### Adding Dependencies

Always use Yarn to add dependencies:

```bash
# Add a production dependency
yarn add package-name

# Add a development dependency
yarn add --dev package-name
```

### Version Control

- Do not commit the `node_modules` directory
- Do commit the `yarn.lock` file to ensure consistent dependency versions
- Do not commit the `package-lock.json` file (it should be in .gitignore)

## Security Notes

This project uses Yarn's resolutions field in package.json to fix security vulnerabilities in deep dependencies. If you get security warnings after adding new packages, please review and update the resolutions field as needed.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

To learn about Yarn, check out the [Yarn documentation](https://yarnpkg.com/getting-started).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
