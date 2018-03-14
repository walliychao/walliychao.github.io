module.exports = {
    path: 'audioTester',
    getComponent: (location, callback) => {
        require.ensure([], () => {
            callback(null, require('./Page'))
        })
    }
}