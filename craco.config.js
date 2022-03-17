const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "primary-color": "#4e7354",
              "link-color": "#508960",
              "layout-trigger-background": "#12284b",
              "processing-color": "#714783",
              "highlight-color": "#e24886",
              "error-color": "#e24886",
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
