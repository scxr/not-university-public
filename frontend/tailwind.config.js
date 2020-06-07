module.exports = {
    purge: [
        './src/**/*.tsx'
    ],
    theme: {
        extend: {
            fontFamily: {
                'natural': ['Natural', 'sans-serif'],
                'baron': ['Baron', 'sans-serif'],
                'default': ['system-ui', '-apple-system', ' BlinkMacSystemFont', 'Roboto', 'sans-serif']
            }
        }
    },
    variants: {},
    plugins: [],
};
