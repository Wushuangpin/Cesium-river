module.exports = {
    devServer: {
        port: 8081,
        proxy: {
            '/login': { target: 'http://localhost:83/src/php/login.php', changeOrigin: false },
            '/sql': { target: 'http://localhost:83/src/php/users.php', changeOrigin: false },
            '/bootstrap': { target: 'http://localhost:83/src/assets/css/bootstrap.css', changeOrigin: false },
            '/admin': { target: 'http://localhost:83/src/assets/css/admin.css', changeOrigin: false },
            '/animate': { target: 'http://localhost:83/src/assets/css/animate.min.css', changeOrigin: false },
            '/nprogress': { target: 'http://localhost:83/src/assets/js/nprogress.js', changeOrigin: false },
        }
    },

}