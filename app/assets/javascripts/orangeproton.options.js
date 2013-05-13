/**
 * Global options
 * @class op
 * @property {String} [apiBase=/api/v1]
 */
var op = { apiBase: '/api/v1' };

/**
 * @class orangeproton.options
 * All default options for orange-proton
 */
var orangeproton = orangeproton || {};
orangeproton.options = {
  /**
   * Configurations for various libraries
   */
  libraries: {
    fancybox: {
      maxWidth: 1000,
      maxHeight: 600,
      fitToView: false,
      width: '70%',
      height: '70%',
      autoSize: false,
      closeClick: false,
      openEffect: 'none',
      closeEffect: 'none'
    },

    spinner: {
      lines: 13, // The number of lines to draw
      width: 4, // The line thickness
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false // Whether to use hardware acceleration
    },

      docSpinner: {
          lines: 13, // The number of lines to draw
          width: 4, // The line thickness
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          left: 150
      },
      tipsy: {
          trigger: 'hover',
          gravity: 'n',
          delayIn: '300',
          delayOut: '100',
          fade: 'true',
          opacity: 1
      }
  },

  /**
   * How many nodes should be displayed of each type
   */
  display: {
    max_syn: 100, // max number of synonyms to display
    max_fields: 7, // max number of fields
    max_drgs: 10,
    max_sub: Infinity,
    max_inclusiva: 6,
    max_exclusiva: 6,
    max_docs: 5,
    as_list: true
  },

  crumbs: {
      maxCrumbs: 10
  }
};
