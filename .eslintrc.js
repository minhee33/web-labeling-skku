module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "no-undef": "off",
        "react/prop-types": "off",
        "no-unused-vars": "off",
        "no-reachable": "off",
        "react/no-unknown-property": ['off', { ignore: ['css'] }]
    },
}
