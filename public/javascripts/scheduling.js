$(document).ready(() => {
    /**
     * Hide the optional zoom link and location text fields by default, make them appear when a class option is clicked on
     */
    $('.class-option').click(function() {
        if ( $(this).parent().siblings().hasClass('visible-option') ) {
            $(this).parent().siblings().removeClass('visible-option');
            $(this).parent().siblings().addClass('hidden-option');
        }
        else {
            $(this).parent().siblings().removeClass('hidden-option');
            $(this).parent().siblings().addClass('visible-option');
        }
    });

    let dropdown = document.getElementById('dropdown');
    let anchor = document.getElementsByClassName('anchor')[0];
    anchor.addEventListener('click', () => {
        if (dropdown.classList.contains('visible')) {
            dropdown.classList.remove('visible');
        }
        else {
            dropdown.classList.add('visible');
        }
    });
});



