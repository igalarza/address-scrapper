
const grunt = require('grunt')

grunt.loadNpmTasks('grunt-jasmine-node')
grunt.loadNpmTasks('grunt-jasmine-node-coverage')

module.exports = function (grunt) {

  grunt.initConfig({
    jasmine_node: {
      options: {
        forceExit: true,
        coverage: {
          includeAllSources: true
        },
        jasmine: {
          spec_dir: 'test',
          spec_files: [
            '**/*spec.js'
          ]
        }
      },
      src: ['src/**/*.js']
    }
  })
  grunt.registerTask('test', ['jasmine_node'])
  grunt.registerTask('default', ['test'])
}
