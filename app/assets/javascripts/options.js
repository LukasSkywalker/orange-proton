var orangeproton = {
  options: {
    libraries: {
      fancybox: {
        maxWidth	: 1000,
        maxHeight	: 600,
        fitToView	: false,
        width		: '70%',
        height		: '70%',
        autoSize	: false,
        closeClick	: false,
        openEffect	: 'none',
        closeEffect	: 'none'
      },

      spinner: {
        lines: 13, // The number of lines to draw
        width: 4, // The line thickness
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false // Whether to use hardware acceleration
      }
    },

    display: {
      max_syn : 5, // max number of synonyms to display
      max_fields : 7, // max number of fields
      max_drgs : 10,
      max_sub : 5,
      max_inclusiva : 3,
      max_exclusiva : 3,
      max_docs: 5,
      as_list: true
    },

    defaultLocation: {
      lat: 46.951288,
      lng: 7.438774
    }
  }
}
