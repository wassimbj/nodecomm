$(document).ready(function () {
    // ######### Set ups ##########
    const loader = `<div class='d-flex flex-column align-items-center justify-content-center w-100'>
					<img src='https://www.tenaquip.com/images/ajax-loader.gif' width='80'>
				 	<small class='mt-2 text-muted'> Please wait... </small>
				 </div>`;

// ##################### add product to cart #####################
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
                    $('.nav-item .cart').addClass('cart_is_filled')
                }else{
                    location.pathname = '/auth/login';
                }
            }
        });
    });
    // end of add to cart function

// ###################### Filter products #########################
    filter_products()
    function filter_products()
    {
        var min = $('#min_price').val(),
            max = $('#max_price').val();
        var category = get_filter('category');
        var brand = get_filter('brand');
        var color = get_filter('color');
        var sorting = $('.sorting').val();
        $.ajax({
            url: '/shop',
            method: 'POST',
            data: {
                min, max,
                category: JSON.stringify(category),
                brand: JSON.stringify(brand),
                color: JSON.stringify(color),
                sorting
            },
            beforeSend: () => { $('#shop_products').html(loader) },
            success: function(data)
            {
                // console.log(data)
                $('#shop_products').html(data)
            }
        });
    }

    function get_filter(input)
    {
        let filters = [];
        $(`input[name=${input}]:checked`).each(function(){
            filters.push($(this).val());
        });
        return filters;
    }

    $('.sorting').on('change', function(){
        filter_products();
    })
    $('.filter_input').on('change', function(){
        console.log('CLICKED !!');
        filter_products();
    });
    /*----------------------------------------------------*/
    /*  Slider range
    /*----------------------------------------------------*/
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: $(this).find('#max_price').val(),
        values: [0, $(this).find('#max_price').val()],
        slide: function (event, ui) {
            $("#amount").val(`$${ui.values[0]} - $${ui.values[1]}`);
            $('#min_price').val(ui.values[0]);
            $('#max_price').val(ui.values[1]);
            filter_products();
        }
    });
    $("#amount").val("$" + $("#slider-range").slider("values", 0) +
        " - $" + $("#slider-range").slider("values", 1));


// ####################### Pagination ########################
    var page = 1;
    $('.page-item').on('click', function(){
        // let page = $(this).data('page');
        var action = $(this).data('action'),
            btn = $(this);

            if(action == 'next')
                page++;
            else if(action == 'prev')
                page--

        $.ajax({
            url: '/shop/page',
            method: 'POST',
            data: {page},
            success: function (status) {
                console.log(page, status)
                if(status)
                {
                    filter_products();
                    $('.page-item').attr('disabled', false)
                    
                }else{
                    btn.attr('disabled', true).siblings().attr('disabled', false)
                }
            }
        });
    });

// ################## Add to wishlist #################
    $(document).on('click', '.add_to_wishlist', function(){
        const product_id = $(this).data('id'),
                btn = $(this);
        $.ajax({
            url: '/wishlist/add',
            method: 'POST',
            data: {product_id},
            success: (added) => {
                if(added.action == 'create')
                {
                  btn.addClass('bg-danger text-white');
                } else if (added.action == 'remove')
                {
                    btn.removeClass('bg-danger text-white');
                }else if(added.action == 'error' && added.msg == 'login'){
                    location.pathname = '/auth/login';
                }else{
                    alert(added)
                }
            }
        });
    });
    
}); // END OF jQuery