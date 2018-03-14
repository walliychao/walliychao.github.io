module.exports = {
    path: 'imageTester',
    getComponent: (location, callback) => {
        require.ensure([], () => {
            callback(null, require('./Page'))
        })
    }
}