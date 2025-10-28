$(function () {

    $(".toggle-password").on('click', function () {
        //alert("hello");
        $(this).toggleClass("input-eye-slash");
        var input = $($(this).attr(".toggle-password"));
        //alert();
        if ($('#password').attr("type") == "password") {
            /*alert("hello done");*/
            $('#password').attr("type", "text");
        } else {
            $('#password').attr("type", "password");
        }
    });

});