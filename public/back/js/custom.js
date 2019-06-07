$(document).ready(function(){

    // init Summernote
    // $('.summernote').summernote({
    //     tabsize: 2,
    //     height: 200
    // });
    

    // Change order status
    $(document).on('change', '.order_status', function(){
        var status = $(this).is(':checked'),
            id = $(this).data('orderid');

        $.ajax({
            url: '/admin/orders/status',
            method: 'POST',
            data: {status, id},
            success: (data) => {
                console.log(data)
            }
        });
    });
}); // end of jQuery