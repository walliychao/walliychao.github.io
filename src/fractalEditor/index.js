module.exports = [
    {
        path: 'fractalEditor',
        getComponent: (location, callback) => {
            require.ensure([], () => {
                callback(null, require('./Page'))
            })
        }
    },
    {
        path: 'custom',
        getComponent: (location, callback) => {
            require.ensure([], () => {
                callback(null, require('./Custom'))
            })
        }
    }
    
]