$(document).ready(function () {
    // ######### Set ups ##########
    const loader = `<div class='d-flex flex-column align-items-center justify-content-center w-100'>
					<img src='https://www.tenaquip.com/images/ajax-loader.gif' width='80'>
				 	<small class='mt-2 text-muted'> Please wait... </small>
				 </div>`;

    // Add product to cart
    $(document).on('click', '.add_to_cart', function(e){
        e.preventDefault();
        let product = $('input[name="product"]').val(),
            color = $('input[name="color"]:checked').val(),
            size = $('input[name="size"]:checked').val(),
            quantity = $('input[name="quantity"]').val(),
            btn = $(this);

        let data = {
            product,
            color: color || '',
            size: size || '',
            quantity
        };

        $.ajax({
            url: '/user/cart/add',
            method: 'POST',
            data: data,
            beforeSend: () => { btn.html("<img src='https://www.tenaquip.com/images/ajax-loader.gif' width='30px'>") },
            success: (data) => {
                btn.html('ADD TO CART');
                if (data.type == 'error')
                    $('#error-msg').html(`<div class='text-danger mt-2'> ${data.msg} </div>`)
                else if(data.type == 'success'){
                    $('#error-msg').html(`<div class='alert alert-success mt-2'> ${data.msg} </div>`)
                }else{
                    location.pathname = '/login';
                }
            }
        });
    });

});