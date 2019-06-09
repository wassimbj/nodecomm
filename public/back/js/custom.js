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

    // Get sub categories from parent categories
    function getSubCategories(parent_id)
    {
        $.ajax({
            url: '/admin/category/sub',
            method: 'POST',
            data: { parent: parent_id },
            success: (data) => {
                $('#sub-c').html(data)
            }
        })
    }
    // By default get the selected category
    getSubCategories($('#select_category').find('option:selected').data('cateid'))
    // when select a new category get its sub
    $('#select_category').on('change', function(){
        let parent = $(this).find('option:selected').data('cateid');
        getSubCategories(parent);
    });
}); // end of jQuery