module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'apps/common.js',
      'apps/option/blocked_site.js',
      'apps/option/blocked_sites.js',
      'apps/content_script/block_reason.js',
      'apps/content_script/block_state.js',
      'test/*.js'
    ],
    preprocessors: {
      'apps/content_script/block_state.js': ['coverage']
    },
    browsers: ['ChromeHeadless'],
    reporters: ['mocha', 'coverage'],
    logLevel: config.LOG_DEBUG
  })
}