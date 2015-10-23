(function( $ ) {
    $.fn.btnWait = function(wait) {
        this.each(function() {
            var e = $(this);
            e.prop('disabled', wait);
            e.find('.fa').toggleClass('fa-spin', wait);
        });
        return this;
    };
}( jQuery ));