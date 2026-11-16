/* Grid display and management at the client - G.S. 20150527 */

var _Grid = { template: null };

var WarehNum = 1;

function displayGrid(paramObj) {

    if (document.getElementById("dlnr_wrapper_outer"))
        dlnr_wrapper_outer.style.display = "block";
    /*$('#results_wrapper').fadeOut("fast", function () {
        $('#result_data_loader').css("display", "block");
        $(this).html("");*/
    $.post('/Grid.ashx', paramObj, function (data) {
        $('#result_data_loader').css('display', 'none');
        var json = JSON.parse(data);

        var parts = json.Parts;

        if (!parts.length) {
            var fmessage = document.getElementById('FailMessage').value;
            $('#results_wrapper').html('<h2 class="text-center" style="color:red;">' + fmessage + '</h2>');
            return;
        }

        //$('body,html').animate({
        //    scrollTop: 0                       // Scroll to top of body
        //}, 500);

        WarehNum = parts[0].NumWareh;

        var buffer = '';
        //paging top

    
        if (_Grid.template == null) {
            sleep(1000);

        }
         
        $('#pagingTop').html(_Grid.template.PagingTop);
        //buffer += _Grid.template.PagingTop;

        var i, j, p;
        // create basic elements
        for (i = 0; i < parts.length; i++)
            buffer += _Grid.template.Main.replace('<div ', '<div id="' + parts[i].Id + '" ');

        //paging bottom
        $('#pagingBottom').html(_Grid.template.PagingBottom);
        //buffer += _Grid.template.PagingBottom;

        //$('#result_data_loader').css("display", "none");
        //$('#results_wrapper').fadeIn("fast", function () {

        $('#results_wrapper').html(buffer);

        //        $("#results_wrapper")[0].scrollIntoView();
        if ($(window).width() < 768)
            //            document.getElementById('results_wrapper').parent.scrollIntoView(true);
            $("#results_wrapper")[0].scrollIntoView();
        else
            document.body.scrollIntoView(true);

        var displayParams = "{";

        $.each(paramObj, function (key, value) {
            if ((key != "Offset") && (key != "Limit")) {
                displayParams += key + ": '" + value + "',";
            }
        });

        var offsetParam = "Offset: '#',";
        var limit = json.Limit;
        var limitParam = "Limit: '" + limit + "'";

        $("#resultsPerPage").val(limit);

        var offset = Math.round(json.Offset / limit);

        var index = offset;

       // paging top
       
        $("#resultsPerPage").change(function () {          
            var paramObj2 = paramObj;
            paramObj2["Offset"] = 0;
            paramObj2["Limit"] = $("#resultsPerPage").val();
            
            if (typeof tyre__template != 'undefined') {
                if (tyre__template == 'YES') {
                    console.log(paramObj2);
                    displayGridwithTemplate({ Action: 'GetTyreTemplate' }, paramObj2);

                }
            } else {
                displayGrid(paramObj2);
            }


         
        });

        //paging bottom previous button visibility
        if (index > 5) {
            offset = index -= 5;
            $("#previousPageTD").removeClass("hidden");
        } else {
            offset = index = 0;
            $("#previousPageTD").addClass("hidden");
        }

        $(".indexPage").each(function () {
            offset = index * limit;

            if (offset < json.TotalResults) {
                if (json.Offset != offset) {
                    //current element (not the selected page)
                    $(this).parent().attr("onclick", "displayGrid(" + displayParams + offsetParam.replace("#", offset) + limitParam + "})");
                } else {
                    //current element (selected page)
                    $(this).attr("href", "##");
                    $(this).parent().addClass("selectedPageIndex");

                    $("#pagingGoToTextbox").val(index + 1);

                    //previous page (left arrow) element
                    $("#previousPageLink").parent().attr("onclick", "displayGrid(" + displayParams + offsetParam.replace("#", (offset - limit)) + limitParam + "})");

                    //next page (right arrow) element
                    $("#nextPageLink").parent().attr("onclick", "displayGrid(" + displayParams + offsetParam.replace("#", (offset + limit)) + limitParam + "})");
                }
                $(this).parent().removeClass("hidden");
            } else {
                $(this).parent().addClass("hidden");
                $("#nextPageTD").addClass("hidden");
            }

            $(this).text(index + 1);
            index++;
        });

        var pagingPagesNumber;

        if (Math.round(json.TotalResults / limit) < json.TotalResults / limit) {
            pagingPagesNumber = Math.round(json.TotalResults / limit) + 1;
        } else {
            pagingPagesNumber = Math.round(json.TotalResults / limit);
        }
        $("#pagingGoToPagesNumber").text(pagingPagesNumber);

        //toggle paging visibility
        if ($.isNumeric(limit)) {
            $(".pagingTopDiv").removeClass("hidden");
        } else {
            $(".pagingTopDiv").addClass("hidden");
        }

        if (limit > 0) {
            $(".pagingBottomDiv").removeClass("hidden");
        } else {
            $(".pagingBottomDiv").addClass("hidden");
        }

        $("#pagingGoToTextbox").click(function () {
            this.select();
        });

        $("#pagingGoToTextbox").keypress(function (event) {
            var code = event.keyCode || event.which;
            if (code == 13) {
                event.preventDefault();

                if (($.isNumeric(($(this).val()))) && ($(this).val() <= pagingPagesNumber)) {
                    var paramObj2 = paramObj;
                    paramObj2["Offset"] = ($(this).val() * limit) - limit;
                    paramObj2["Limit"] = limit;
                    displayGrid(paramObj2);
                }
            }
        });

        // fill elements
        var elm, elm1, elm2, elm3;
        for (i = 0; i < parts.length; i++) {

            //laz c-c only for item description
            //var brand = $(".carmakeselector option:selected").text();
            //var model = $(".carmodelselector option:selected").text();
            //var cat = $("#categoryselected").text();

            elm = $('#results_wrapper > div#' + parts[i].Id);
            //$(elm).find('.cgvPartNo').html(parts[i].PartNo);  !!! ΝΑ ΦΥΓΕΙ ΑΠΟ ΤΟ HANDLER, DB
            $(elm).find('.cgvPartNo').html(parts[i].DisplayCode);
            //laz c-c only
            //$(elm).find('.cgvDescription').html(brand + '-' + model + '-' + cat);
            $(elm).find('.cgvDescription').html(parts[i].Description);
            elm1 = $(elm).find('.cgvDLNr');
            $(elm1).prop('src', /*$(elm1).prop('src') +*/parts[i].brand.Code); //proper factory image URL
            $(elm1).prop('alt', /*$(elm1).prop('src') +*/parts[i].brand.Description); //proper factory image URL
            elm1 = $(elm).find('.cgvDocUrl');
            $(elm1).prop('src', /*$(elm1).prop('src') +*/ parts[i].DocUrl);
            $(elm1).prop('data-zoom-image', /*$(elm1).prop('src') +*/ parts[i].DocUrl);
         
            // v o gia tyres  
            if (typeof tyre__template != 'undefined') {
                if (parts[i].Description2.trim() != '' && tyre__template == 'YES') {
             
                    var tyrespecs = parts[i].Description2.trim().split(' ');
                    elm1 = $(elm).find('.fuel');
                    $(elm1).prop('src', /*$(elm1).prop('src') +*/ '/App_Themes/Boot_theme/images/TYRES-IMAGES/fuel_' + tyrespecs[0].trim() + '.png');
                    elm1 = $(elm).find('.fuelh');
                    $(elm1).text(tyrespecs[0].trim());
                    elm1 = $(elm).find('.grip');
                    $(elm1).prop('src', /*$(elm1).prop('src') +*/'/App_Themes/Boot_theme/images/TYRES-IMAGES/wetgrip_' + tyrespecs[1].trim() + '.png');
                    elm1 = $(elm).find('.griph');
                    $(elm1).text(tyrespecs[1].trim());
                    elm1 = $(elm).find('.noise');
                    $(elm1).prop('src', /*$(elm1).prop('src') +*/ '/App_Themes/Boot_theme/images/TYRES-IMAGES/noise_' + tyrespecs[3].trim() + '.png');
                    elm1 = $(elm).find('.noiseh');
                    $(elm1).text(tyrespecs[3].trim());
                    elm1 = $(elm).find('.noise2');
                    $(elm1).prop('src', /*$(elm1).prop('src') +*/'/App_Themes/Boot_theme/images/TYRES-IMAGES/noise_cat_c' + tyrespecs[2].trim() + '.png');
                    elm1 = $(elm).find('.noise2h');
                    $(elm1).text('c'+tyrespecs[2].trim());
                    elm1 = $(elm).find('.img_cont');

                    elm1.hover(function () {
                        $(this).find('.tyre_spec_img').css("display", "block");
                    }, function () {
                        $(this).find('.tyre_spec_img').css("display", "none");
                    });
                } 
            }


            //$(elm1).elevateZoom();
            //$(elm1).data('zoom-image', parts[i].DocUrl).elevateZoom(); 

            //console.log(parts[i]);
            /********** LAZ - Hide pdf-video if no file exists **********/
            $(elm).find('.minibase_pdf').hide();
            $(elm).find('.minibase_video').hide();
           
            /********** End of Hide pdf-video **********/

            $(elm).find('.form_offer').hide();

            if (parts[i].hasOwnProperty('FoundVia')) {
                $(elm).find('.codecomesfrom').html(parts[i].FoundVia);
                $(elm).find('.viscode').css('display', 'block');
            }


            var frameSrc = "";  // V O Gia Monroe
            // frameSrc = "http://monroe.spsbe.com/Documents/360Monroe/10014-%20HTML5/preview.html";
            var monroe = "monroe";
            if (parts[i].DocUrl.indexOf(monroe) > -1) {
                frameSrc = parts[i].DocUrl;
            }
         
            var monroeref = $(elm).find('.monroe_3d');
                if (frameSrc.trim()!= "") {                 
                    $('iframe').attr("src", frameSrc);
                    $('.monroe_3d').click(function () {
                        $('#myModal').modal({ show: true })
                    });
                } else {
                    $(monroeref).css("display", "none");
               }


            var lightref = $(elm).find('.lightboxhref');
            $(lightref).prop('href', parts[i].DocUrl);

            var lightappl = $(elm).find('.lightboxappl');
            $(lightappl).prop('href', '/ProductApps.aspx?ItemId=' + encodeURIComponent(parts[i].ItemCode));

            var lighttech = $(elm).find('.lightboxtech');
            $(lighttech).prop('href', '/ProductProperties.aspx?ItemId=' + encodeURIComponent(parts[i].ItemCode));

            var lightrefs = $(elm).find('.lightboxrefs');
            $(lightrefs).prop('href', '/ProductRefs.aspx?ItemId=' + encodeURIComponent(parts[i].ItemCode) + '&oe=no&ds=yes');

            var lightgen = $(elm).find('.lightboxgen');
            $(lightgen).prop('href', '/ProductRefs.aspx?ItemId=' + encodeURIComponent(parts[i].ItemCode) + '&oe=yes&ds=no');

            var minibase = $(elm).find('.minibasebox');
            var mbDescription = encodeURIComponent(parts[i].Description);
            mbDescription = mbDescription.replace('--', '-');
            $(minibase).prop('href', '/MiniBase.aspx?ItemId=' + encodeURIComponent(parts[i].ItemCode) + '&BrandCode=' + encodeURIComponent(parts[i].BrandCode) + '&ProthTec=' + encodeURIComponent(parts[i].ProthTec) + '&ItemDesc=' + mbDescription + '&TabNumber=' + "1");

            //LAZ: PDF with MiniBase
            var minibasePDF = $(elm).find('.minibase_pdf');
            //$(minibasePDF).prop('href', '/MiniBase.aspx?ItemId=' + encodeURIComponent(parts[i].ItemCode) + '&BrandCode=' + encodeURIComponent(parts[i].BrandCode) + '&ProthTec=' + encodeURIComponent(parts[i].ProthTec) + '&ItemDesc=' + mbDescription + '&TabNumber=' + "5");
            var pdf_url = parts[i].ItemCode.replace("/", "_47_").replace("\\", "_92_").replace(":", "_58_").replace("*", "_42_").replace("?", "_63_").replace("<", "_60_").replace(">", "_62_").replace("|", "_124_").replace("\"", "_34_").replace("-", "_45_").replace("%", "_37_").replace("", "_26_");
            $(minibasePDF).prop('href', '/Company/Pdf/' + pdf_url + '.pdf');

            var minibaseVIDEO = $(elm).find('.minibase_video');
            $(minibaseVIDEO).prop('href', '/MiniBase.aspx?ItemId=' + encodeURIComponent(parts[i].ItemCode) + '&BrandCode=' + encodeURIComponent(parts[i].BrandCode) + '&ProthTec=' + encodeURIComponent(parts[i].ProthTec) + '&ItemDesc=' + mbDescription + '&TabNumber=' + "6");


            if ($(".cgvUniWareh", $(elm)).length == 0)
                for (j = 0; j < parts[i].NumWareh; j++)
                    $(elm).find('.cgvWarehTab').append(_Grid.template.Wareh);
            $(".MoreInfo", $(elm)).attr('href', '/Part/' + URLNormalize(parts[i].Description) + '/e' + parts[i].ItemCode.replace(/\//g, "!slsh!").replace(/ /g, "!spc!").replace(/#/g, "!hstg!"));
        }

        //$("img").error(function () {
        //    $(this).hide();
        //});
     
        var partsPA,
            partsToStr = JSON.stringify(parts, ['Id', 'ItemCode']);
        // // fill price
        // var pricesxhr = $.post('/Grid.ashx', { Action: 'GetPrices', Parts: partsToStr }, function (data) {
        //     if (data == "") {
        //         $(".pricesList").addClass("hidden");
        //     } else {
        //         partsPA = JSON.parse(data);

        //         for (i = 0; i < partsPA.length; i++) {
        //             elm = $('#results_wrapper > div#' + partsPA[i].Id);
        //             elm1 = $(elm).find('.pricesList');
        //             for (p = 0; p < partsPA[i].pricesList.length; p++)
        //                 $(".cgvPriceOption" + (p + 1), $(elm1)).html(partsPA[i].pricesList[p].priceValue);
        //         }
        //     }
        // });
        // // fill availability
        //var availxhr = $.post('/Grid.ashx', { Action: 'GetAvailability', Parts: partsToStr }, function (data) {
        //     partsPA = JSON.parse(data);
        //     for (i = 0; i < partsPA.length; i++) {
        //         elm = $('#results_wrapper > div#' + partsPA[i].Id);

        //         $(".WarehTotal", $(elm)).val(partsPA[i].WarehTotal);

        //         if ($(".cgvUniWareh", $(elm)).length) {
        //             $(elm).find('.AvailDescr').html(partsPA[i].WarehList[0].WarehAvail);
        //             $(elm).find('.cgvWarehInCart').text(partsPA[i].WarehList[0].WarehInCart);
        //             $(elm).on('click', '.btn-cart', { Id: partsPA[i].ItemCode, Wareh: partsPA[i].WarehList[0].Wareh, QtyRef: $(".spinner > input", $(elm)) }, function (event) { AddToCart(this, event.data.Id, event.data.Wareh, event.data.QtyRef) });
        //         }
        //         else {
        //             elm1 = $(elm).find('.cgvWarehTab');
        //             for (j = 0; j < partsPA[i].WarehList.length && j < parts[i].NumWareh; j++) {
        //                 elm2 = $(elm1).children('tbody tr:nth-child(' + (j + 1) + ')');
        //                 $(elm2).find('.cgvWarehDescr').html(partsPA[i].WarehList[j].WarehDescr);
        //                 elm3 = $(elm2).find('.cgvWarehAvail');
        //                 $(elm3).html(partsPA[i].WarehList[j].WarehAvail);
        //                 $(elm2).find('.cgvWarehInCart').html(partsPA[i].WarehList[j].WarehInCart);
        //                 $(elm2).on('click', '.btn-cart', { Id: partsPA[i].ItemCode, Wareh: partsPA[i].WarehList[j].Wareh, QtyRef: $(".spinner > input", $(elm2)) }, function (event) { AddToCart(this, event.data.Id, event.data.Wareh, event.data.QtyRef) });
        //             }
        //         }
        //     }
        //});

      //  $.when($.post('/Grid.ashx', { Action: 'GetPrices', Parts: partsToStr }), $.post('/Grid.ashx', { Action: 'GetAvailability', Parts: partsToStr })).done(function (prices, avails) {
        
        var chboxpr = ""; //NTASK

        if ($("#CheckBoxPrices").length > 0) {
            if (document.getElementById('CheckBoxPrices').checked) {
                chboxpr = "checked";
            } else {
                chboxpr = "unchecked";
            }
        }
        else
        {
            chboxpr = "unchecked";
        }

       
        

        //kalei kai tis treis methodous kai ston handler analoga to servise to pelath apofasizei poies tha ektelestoun
        //laz    
        $.when($.post('/Grid.ashx', { Action: 'GetPrices', Parts: partsToStr, CheckPrice: chboxpr }), $.post('/Grid.ashx', { Action: 'GetAvailability', Parts: partsToStr }), $.post('/Grid.ashx', { Action: 'GetPricesAndAvail', Parts: partsToStr, CheckPrice: chboxpr }), $.post('/Grid.ashx', { Action: 'Display_video_icon', Parts: partsToStr }), $.post('/Grid.ashx', { Action: 'Display_pdf_icon', Parts: partsToStr }), $.post('/Grid.ashx', { Action: 'Display_offer_img', Parts: partsToStr })).done(function (prices, avails, price_avails, video, pdf, form_offer) { //NTASK
          //$.when($.post('/Grid.ashx', { Action: 'GetPrices', Parts: partsToStr }), $.post('/Grid.ashx', { Action: 'GetAvailability', Parts: partsToStr }), $.post('/Grid.ashx', { Action: 'GetPricesAndAvail', Parts: partsToStr })).done(function (prices, avails, price_avails) {
         
            var priceflg = prices[0];
            var availflg = avails[0];
            //var videoflg = video[0];
            //var pdfflg = pdf[0];
            if (prices[0] == "GetpricesNotExecuted" && avails[0] == "GetAvalabilityNotExecuted") {
                var AvailPrices = price_avails[0].split("|");
                partsPA = JSON.parse(AvailPrices[0]);
                avails[0] = AvailPrices[0];
                prices[0] = AvailPrices[1];
             
            }     
                
            partsPA = JSON.parse(avails[0]);
         
            for (i = 0; i < partsPA.length; i++) {
                elm = $('#results_wrapper > div#' + partsPA[i].Id);
                $(".WarehTotal", $(elm)).val(partsPA[i].WarehTotal);
                var changestatus = partsPA[i].WarehList[0].ChangeStatus;

                /********** LAZ - Hide pdf-video if no file exists **********/
                //$(elm).find('.minibase_pdf').hide();
                //$(elm).find('.minibase_video').hide();
                /********** End of Hide pdf-video **********/

                if ($(".cgvUniWareh", $(elm)).length) {
                    $(elm).find('.AvailDescr').html(partsPA[i].WarehList[0].WarehAvail);
                    $(elm).find('.cgvWarehInCart').text(partsPA[i].WarehList[0].WarehInCart);
                    $(elm).on('click', '.btn-cart', { Id: partsPA[i].ItemCode, Wareh: partsPA[i].WarehList[0].Wareh, QtyRef: $(".spinner > input", $(elm)), Changestatus: changestatus }, function (event) { AddToCart(this, event.data.Id, event.data.Wareh, event.data.QtyRef, event.data.Changestatus) });
                }
                else {
                    elm1 = $(elm).find('.cgvWarehTab');
                    for (j = 0; j < partsPA[i].WarehList.length && j < parts[i].NumWareh; j++) {
                        elm2 = $(elm1).children('tbody tr:nth-child(' + (j + 1) + ')');
                        $(elm2).find('.cgvWarehDescr').html(partsPA[i].WarehList[j].WarehDescr);
                        elm3 = $(elm2).find('.cgvWarehAvail');
                        $(elm3).html(partsPA[i].WarehList[j].WarehAvail);
                        $(elm2).find('.cgvWarehInCart').html(partsPA[i].WarehList[j].WarehInCart);
                        $(elm2).on('click', '.btn-cart', { Id: partsPA[i].ItemCode, Wareh: partsPA[i].WarehList[j].Wareh, QtyRef: $(".spinner > input", $(elm2)), Changestatus: changestatus }, function (event) { AddToCart(this, event.data.Id, event.data.Wareh, event.data.QtyRef, event.data.Changestatus) });
                    }
                }
            }
           
                if (prices[0] == "") {
                    $(".pricesList").addClass("hidden");
                } else {
                    partsPA = JSON.parse(prices[0]);
                    
                    for (i = 0; i < partsPA.length; i++) {

                        elm = $('#results_wrapper > div#' + partsPA[i].Id);
                        elm1 = $(elm).find('.pricesList');

                        /****** #PresentationLayerLogic *****\
                        /* OLD Presentation layer logic*/
                        for (p = 0; p < partsPA[i].pricesList.length; p++) {
                            $(".cgvPriceOption" + (p + 1), $(elm1)).html(partsPA[i].pricesList[p].priceValue);
                        }

                        /* New Presentation layer logic*/
                        /* if cgvPriceDescr ==''  then skip cgvPriceOption */
                        //priceValue counter
                        //if cgvPriceDescr apply new Presentation layer logic
                        if ($(".cgvPriceDescr" + (p + 1), $(elm1)).length) {
                            var c = 0;
                            for (p = 0; p < 3; p++) {
                                var descr = $(".cgvPriceDescr" + (p + 1), $(elm1)).text();
                                if (descr != '') {
                                    $(".cgvPriceOption" + (p + 1), $(elm1)).html(partsPA[i].pricesList[c].priceValue);
                                    c++;
                                }
                                else {
                                    $(".cgvPriceOption" + (p + 1), $(elm1)).html('');
                                }
                            }
                        }

                        if (priceflg == "GetpricesNotExecuted" && availflg == "GetAvalabilityNotExecuted") {
                            $(elm1).append("<div class=\"col-md-12\" style=\"display:flex;\">" + partsPA[i].offermsg + "</div>"); // v o case megaparts that doesn't use pricepol. we retrieve the offers from servise

                        }
                    }
                }
                
                //Show video
                if (video[0] == "") {
                    $(elm).find('.minibase_video').hide();
                } else {
                    partsPA = JSON.parse(video[0]);
                    for (i = 0; i < partsPA.length; i++) {
                        elm = $('#results_wrapper > div#' + partsPA[i].Id);
                            $(elm).find('.minibase_video').show();
                    }
                }
                
                ////show pdf
                if (pdf[0] == "") {
                    $(elm).find('.minibase_pdf').hide();
                } else {
                    partsPA = JSON.parse(pdf[0]);
                    for (i = 0; i < partsPA.length; i++) {
                        elm = $('#results_wrapper > div#' + partsPA[i].Id);
                            $(elm).find('.minibase_pdf').show();
                    }
                }
            //   alert(form_offer[0]);
               
                if (form_offer[0] == "") {
                   
                    $(elm).find('.form_offer').hide();
                } else {
                    partsPA = JSON.parse(form_offer[0]);
                    for (i = 0; i < partsPA.length; i++) {
                        if (partsPA[i].KodPhoto.trim() == '02') {
                        //alert( partsPA[i].KodPhoto);
                        elm = $('#results_wrapper > div#' + partsPA[i].Id);
                       $(elm).find('.form_offer').show();
                        }
                     
                    }
                }

            //////////////////////////////
                //if (prices[0] == "GetpricesNotExecuted" && avails[0] == "GetAvalabilityNotExecuted") {
                //    var response = JSON.parse(offers[0]);

                //$.each(response.Offers, function (index, ItemOffers) {

                //   var ToolTipText = "";
                //   $.each(ItemOffers.ItemOffers, function q(i, ItemOffer) {

                //     ToolTipText += ItemOffer.Offer;

                //    });

                //   var Item = $('#results_wrapper > div#' + ItemOffers.Id);
                //   //alert($('#results_wrapper .cgvPriceOption1').text());
                //   $('.OnOffer', $(Item)).removeClass("hidden");
                //   $('.OnOffer', $(Item)).text(ItemOffers.OfferMessage);
                //   $('.OnOffer', $(Item)).popover({ placement: 'top', title: 'ΠΡΟΣΦΟΡΕΣ E-SHOP', html: true, content: ToolTipText, trigger: 'hover' });
                //});
                //}
            //////////////////////////
            if (!json.SortType)
                return;

            if (typeof tyre__template == 'undefined') {
               
                    document.getElementById("optOrderBy").value = json.SortType;

                    $('#optOrderBy').parents(".botsel").find(".jqTransformSelectWrapper > div > span").text($('select#optOrderBy').find('option[value="' + json.SortType + '"]').text());


                    optOrderByChange();
              
            }
        });

      

        //$.when(pricesxhr, availxhr).done(function () {

        //    if (!json.SortType) 
        //        return;

        //    document.getElementById("optOrderBy").value = json.SortType;

        //    $(".jqTransformSelectWrapper > div > span").text($('select#optOrderBy').find('option[value="' + json.SortType + '"]').text());
        //    optOrderByChange();


        //});

        $.post('/Grid.ashx', {
            Action: 'GetArtOffers', Parts: partsToStr
        },
        function (data) {

            var response = JSON.parse(data);

            $.each(response.Offers, function (index, ItemOffers) {

                var ToolTipText = "";
                $.each(ItemOffers.ItemOffers, function q(i, ItemOffer) {

                    ToolTipText += ItemOffer.Offer;

                });

                var Item = $('#results_wrapper > div#' + ItemOffers.Id);
                //alert($('#results_wrapper .cgvPriceOption1').text());
                $('.OnOffer', $(Item)).removeClass("hidden");
                $('.OnOffer', $(Item)).text(ItemOffers.OfferMessage);
                $('.OnOffer', $(Item)).popover({ placement: 'top', title: 'ΠΡΟΣΦΟΡΕΣ E-SHOP', html: true, content: ToolTipText, trigger: 'hover' });

            });

        });
        FillDlnrPanel();

        $.post('/Grid.ashx', { Action: 'GetAdditionalFields', Parts: partsToStr }, function (data) {
            data = data.replace(/\t/g, '');
            partsPA = JSON.parse(data);
            for (i = 0; i < partsPA.length; i++) {
                elm = $('#results_wrapper > div#' + partsPA[i].Id);
                elm1 = $(elm).find('.cgvAdditionalTech');
				//laz
				elm1.empty();
                if (!$(elm1).length)
                    continue;

                for (j = 0; j < partsPA[i].CustomFields.length; j++) {
                    $(elm1).append(_Grid.template.Tech);
                    elm2 = $(elm1).children('tr:last');
                    if (partsPA[i].CustomFields[j].AddDescr) {
                        $(elm2).find('.cgvTechPropName').html(partsPA[i].CustomFields[j].AddDescr);
                        $(elm2).find('.cgvTechPropValue').html(partsPA[i].CustomFields[j].AddValue);
                        //alert(partsPA[i].CustomFields[j].AddValue);
                    }
                }
            }

        });
        //fill part properties (could be made async if slow)
        //if (parts[0].NumWareh == 1)
        //    for (i = 0; i < parts.length; i++) {
        //        elm = $('#results_wrapper > div#' + parts[i].Id);
        //        elm1 = $(elm).find('.cgvTechTab');



        //        for (j = 0; j < parts[i].Tech.length; j++) {
        //            $(elm1).append(_Grid.template.Tech);    // for compatibility
        //            elm2 = $(elm1).children('div:last');



        //            $(elm2).find('.cgvTechPropName').html(parts[i].Tech[j].TechPropName);
        //            $(elm2).find('.cgvTechPropValue').html(parts[i].Tech[j].TechPropValue);

        //        }
        //    }


        for (i = 0; i < parts.length; i++) {
            elm = $('#results_wrapper > div#' + parts[i].Id);
            elm1 = $(elm).find('.cgvTechTab');
            elm3 = $(elm).find('.cgvTechTab2');
            for (j = 0; j < parts[i].Tech.length; j++) {
                $(elm1).append(_Grid.template.Tech);    // for compatibility
                elm2 = $(elm1).children('tr:last');

                if ($(elm3).length && parts[i].Tech[j].hasOwnProperty('PropId')) {
                    $(elm3).append(_Grid.template.Tech);
                    $(elm3).find('.cgvTechPropName').html(parts[i].Tech[j].TechPropName);
                    $(elm3).find('.cgvTechPropValue').html(parts[i].Tech[j].TechPropValue);
                    continue;
                }

                $(elm2).find('.cgvTechPropName').html(parts[i].Tech[j].TechPropName);
                $(elm2).find('.cgvTechPropValue').html(parts[i].Tech[j].TechPropValue);


            }
        }

    });
    //    });
    //});
    }


    function getGridTemplate(paramObj) {        // the parameter for possible specification of grid type in the future
        //    $.post('/Grid.ashx', { Action: 'GetTemplate' }, function (data) {
        $.post('/Grid.ashx', paramObj, function (data) {
            _Grid.template = JSON.parse(data);
        });
    }


    function displayGridwithTemplate(paramObjTemplate, paramObjGrid) {
        $.post('/Grid.ashx', paramObjTemplate, function (data) {
            _Grid.template = JSON.parse(data);
            displayGrid(paramObjGrid);
        });
    }

    function ScrollTop() {
        if ($.browser.webkit) {
            $('body').animate({ scrollTop: 0 }, 'slow');
        } else {
            $('html').animate({ scrollTop: 0 }, 'slow');
        }
    }

    function sortPriceFactory() {

        var exp = new RegExp("[a-zA-Z0-9]+(.jpg)?\s*$", "g");//extract factory code from image URL.No need to bring a Json field.

        $('#results_wrapper > .griditemst ')
            .sort(function (a, b) {
                var dlnrDiff = $(".cgvDLNr", $(a)).prop('src').match(exp)[0] - $(".cgvDLNr", $(b)).prop('src').match(exp)[0];
                return dlnrDiff ? dlnrDiff : parseFloat($("span.cgvPriceOption1", $(a)).text().replace(",", ".")) - parseFloat($("span.cgvPriceOption1", $(b)).text().replace(",", "."));
            })
        .each(function () { $(this).appendTo('#results_wrapper'); });


    }


    function sortAvailabilityFactory() {

        var exp = new RegExp("[a-zA-Z0-9]+(.jpg)?\s*$", "g");

        $('#results_wrapper > .griditemst ')
            .sort(function (a, b) {
                var dlnrDiff = $(".cgvDLNr", $(a)).prop('src').match(exp)[0] - $(".cgvDLNr", $(b)).prop('src').match(exp)[0];
                return dlnrDiff ? dlnrDiff : parseFloat($(".WarehTotal", $(b)).val()) - parseFloat($(".WarehTotal", $(a)).val());
            })
        .each(function () { $(this).appendTo('#results_wrapper'); });
    }

    function sortAvailabilityPrice() {// Äéáèåóéìüôçôá - ÔéìÞ

        $('#results_wrapper > .griditemst ')
            .sort(function (a, b) {
                var avail = parseFloat($(".WarehTotal", $(b)).prop('value')) - parseFloat($(".WarehTotal", $(a)).prop('value'));//warehTotal is a hidden input inside the template where stock number is placed
                return avail ? avail : parseFloat($("span.cgvPriceOption1", $(a)).text().replace(",", ".")) - parseFloat($("span.cgvPriceOption1", $(b)).text().replace(",", "."));
            })
            .each(function () { $(this).appendTo('#results_wrapper'); });//parents('.griditemst')

    }

    function sortPrices() { // ÔéìÞ
        // ÔÝóô, ìüíï ìå ôéìÞ ãéá ôþñá
        $('#results_wrapper > div span.cgvPriceOption1')
                    .sort(function (a, b) {
                        a = a.innerHTML.split(",")[0].replace(".", "") + "," + a.innerHTML.split(",")[1];
                        a = a.split(" ")[0];
                        b = b.innerHTML.split(",")[0].replace(".", "") + "," + b.innerHTML.split(",")[1];
                        b = b.split(" ")[0];
                        return parseFloat(a) > parseFloat(b) ? 1 : -1;
                    })
                    .each(function () { $(this).parents('.griditemst').appendTo('#results_wrapper'); });
    }

    function AddToCart(CartButton, ID, Wareh, QtyBox, changestatus) {

        var qty = $(QtyBox).val();
        if (qty == 0)
            return;

        var loader = $(".CartLoader", $(CartButton));
        var CartQty = $(".cgvWarehInCart", $(CartButton));
        $(loader).removeClass("hidden");
        $(CartQty).addClass("hidden");
        $.post('/CarCategoryQuery.ashx', { Action: 'NewCart', q: qty, k: ID, w: myTrim(Wareh), oem: $('[id$="genuine"]').val(), SkipAvailability: changestatus, PromoPack: false, Price: '' }, function (data) {

            var response = JSON.parse(data);

            $(loader).addClass("hidden");
            $(CartQty).removeClass("hidden");

            if (response.success) {
                //laz INCREASECARTQUANTITY
                //$(".cgvWarehInCart", $(CartButton)).text(response.oq);
                // stack quantity
                // if (WebSettings.GetString("ESHOP", "INCREASECARTQUANTITY").ToUpper() == "YES") {
                //var x = response.oq;
                //var y = $(".cgvWarehInCart", $(CartButton)).text();
                //var z = parseInt(x) + parseInt(y)
                //$(".cgvWarehInCart", $(CartButton)).text(z);
                //  }
                //default
                //  else {
                $(".cgvWarehInCart", $(CartButton)).text(response.oq);
                //    }
                $('#LabelInfo').text(response.sum);

                
            }
            else {
                bootbox.alert(response.reason);
            }

            if (response.hasOwnProperty('GridText') && response.GridText.length > 0) {
                if ((response.success && $(changeEltrekkaAvailAvailable).val() == "YES") || (!response.success && $(changeEltrekkaAvailNotAvailable).val() == "YES")) {
                    $(".AvailDescr > span", $(CartButton).parents(".griditemst")).text(response.GridText);
                }
            }

            var msg = response.reason;
            //display message in any case
            if (msg) {
                jQuery("#AddToCartModal").on("show", function () {    // wire up the OK button to dismiss the modal when shown
                    jQuery("#AddToCartModal a.btn").on("click", function (e) {
                        //console.log("button pressed");   // just as an example...
                        jQuery("#ReturnMessage", this).html(msg);
                        jQuery("#AddToCartModal").modal('hide');     // dismiss the dialog
                    });
                });

                $("#AddToCartModal").on("hide.bs.modal", function () {    // remove the event listeners when the dialog is dismissed
                    jQuery("#AddToCartModal a.btn").off("click");
                });

                jQuery("#AddToCartModal").on("hidden.bs.modal", function () {  // remove the actual elements from the DOM when fully hidden
                    //jQuery("#AddToCartModal").remove();
                    jQuery("#ReturnMessage", this).html("");
                });

                jQuery("#AddToCartModal").modal({                    // wire up the actual modal functionality and show the dialog
                    "backdrop": "static",
                    "keyboard": true,
                    "show": true                     // ensure the modal is shown immediately
                });
            }

            //var url = window.location.href;

            //alert(url);

            if (response.success) {
                var parentidimg = $(QtyBox).parents('.griditemst');
                var cart = $('#cartidi > #cart .fa-shopping-cart');
                var imgtodrag = $('.cgvDocUrl', $(parentidimg));
                //cart image animation
                if (imgtodrag) {
                    if (WarehNum == 1) {
                        var imgclone = imgtodrag.clone()
                            .offset({
                                top: imgtodrag.offset().top,
                                left: imgtodrag.offset().left
                            })
                            .css({
                                'opacity': '0.5',
                                'position': 'absolute',
                                'height': '150px',
                                'width': '150px',
                                'z-index': '100'
                            })
                            .appendTo($('body'))
                            .animate(
                            {
                                'top': cart.offset().top - 700,
                                'left': cart.offset().left - 340,
                                'width': 75,
                                'height': 75
                            }, 1000, 'easeInOutExpo');
                    }
                    else {
                        var imgclone = imgtodrag.clone()
                            .offset({
                                top: imgtodrag.offset().top,
                                left: imgtodrag.offset().left
                            })
                            .css({
                                'opacity': '0.5',
                                'position': 'absolute',
                                'height': '150px',
                                'width': '150px',
                                'z-index': '100'
                            })
                            .appendTo($('body'))
                            .animate(
                            {
                                //'top': cart.offset().top - 10,
                                //'left': cart.offset().left - 20,
                                'top': cart.offset().top - 450,
                                'left': cart.offset().left - 450,
                                'width': 75,
                                'height': 75
                            }, 1000, 'easeInOutExpo');
                    }

                    $('body,html').animate({
                        scrollTop: 0                       // Scroll to top of body
                    }, 500);

                    //setTimeout(function () {
                    //    cart.effect("shake", {
                    //        times: 2
                    //    }, 200);
                    //}, 1500);

                    imgclone.animate({
                        'width': 0,
                        'height': 0
                    }, function () {
                        $(this).detach()
                    });
                }
            }

        });
    }

    function URLNormalize(s) {
        return s.replace(/[^0-9A-zΑ-ωάέήίόύώ().]/g, " ").replace(/ +/g, "-");
    }

    function ReplaceOddCharacters(s) {
        //return s.replace(s.replace(s.replace(s.trim(), "/", "!slsh!"), " ", "!spc!"), "#", "!hstg!");
        return s.replace(/\//g, "!slsh!").replace(/ /g, "!spc!").replace(/#/g, "!hstg!");
    }

    function optOrderByChange() {

        var eurotcd = document.getElementById('EuroTcdExistence');
        
        if (eurotcd && eurotcd.value) {

            if (results_wrapper.style.display == "none") {
                return;
            }


            var selectedOrder = document.getElementById("optOrderBy").value;
            
            switch (selectedOrder) {
                case '0':
                    sortAvailabilityFactory();
                    break;
                case '1':
                    sortPriceFactory();
                    break;
                case '2':
                    sortAvailabilityPrice();
                    break;
                case '3':
                    sortPrices();
                    break;
                case '4':
                    break;
                default:
                    break;

            }


            ScrollTop();
        }
        //else  // kophke dioti dhmiourgouse provlima 18/02/2016
        //{
        //        $("#ResultsHeaderControls").removeClass("hidden");

        //        if (results_wrapper.style.display == "none") {
        //            //alert("none");
        //            return;
        //        }

        //        var typeIdVal = $("#selectedModelId").val();
        //        var catId = $("#selectedCategoryId").val();
        //        var treeTypeVal = $("#selectedTreeType").val();

        //        var cKey = $('[id$=vSessionId]').val() + 'meta' + typeIdVal + catId + $('[id$=vLang]').val();

        //        var filterHolder = "#ALL#"; //$('#filter-holder').val();
        //        var selectedOrder = document.getElementById("optOrderBy").value;
        //        $.post('/CarCategoryQuery.ashx',
        //        { Action: 'GetResults', categoryId: catId, typeId: typeIdVal, treeType: 'meta', filter: filterHolder, Cache: "yes", Order: selectedOrder, oem: '', cacheKey: cKey }, function (data) {
        //            $('#results_wrapper').html(data);
        //            //andreas
        //            ToggleLayout();

        //            //if ($('#listLayDiv').css("background-position") == "0% 100%") {
        //            //    $('#listLayDiv').css("background-position", "left top");
        //            //    $('#colLayDiv').css("background-position", "right top");
        //            //}
        //            //----------------------------
        //            //BindAddToCart();
        //            ScrollTop();
        //        });
        //}
    }



    function myTrim(x) {
        return x.replace(/^\s+|\s+$/gm, '');
    }

    (function ($) {
        $('#results_wrapper').on('click', '.spinner .btn:first-of-type', function () {
            var input = $(this).parents('.spinner').find('input');
            $(input).val(parseInt($(input).val(), 10) + 1);
        });
        $('#results_wrapper').on('click', '.spinner .btn:last-of-type', function () {
            var input = $(this).parents('.spinner').find('input');

            var val = parseInt($(input).val(), 10);
            if (val > 0)
                $(input).val(val - 1);

            //$(this).parents('.spinner').find('input').val(parseInt($('.spinner input').val(), 10) - 1);
        });
    })(jQuery);


    $('#results_wrapper').tooltip({
        delay: { show: 300, hide: 0 },
        placement: function (tip, element) { //$this is implicit
            var position = $(element).position();
            if (position.left > 515) {
                return "left";
            }
            if (position.left < 515) {
                return "right";
            }
            if (position.top < 110) {
                return "bottom";
            }
            return "top";
        },
        selector: 'span[data-toggle="tooltip"]'
    });

    function FillDlnrPanel()
    {
        var dlnr_wrapper = document.getElementById('dlnr_wrapper');
        var bringFactories = document.getElementById('BringFactories').value;

        if (bringFactories != "1" || !dlnr_wrapper)
            return;

        dlnr_wrapper.innerHTML = "";
        var array = $('#results_wrapper > div .cgvDLNr').get();

        jQuery.each(array.getUnique(),function () {
            
            var div = document.createElement("div");
            div.className = "col-sm-2 supplier-button";
            var img = document.createElement("img");//$('<img class="img-responsive">');
            img.className = "img-responsive";
            img.src = this.src;
            img.alt = this.alt;
            img.style.cursor = "pointer";
            div.appendChild(img);
            dlnr_wrapper.appendChild(div);
            
        });
    }


    Array.prototype.getUnique = function () {
        var u = {}, a = [];
        for (var i = 0, l = this.length; i < l; ++i) {
            var found = 0;
            for (j = 0; j < a.length; j++) {
                if (a[j].alt == this[i].alt) {
                    found = 1;
                    break;
                }
            }
            if (!found) {
                a.push(this[i]);
                u[this[i]] = 1;
            }

        }
        return a;
    }

    $('#dlnr_wrapper').on('click', 'img', function () {

        
        var dlnrImg = $(this);
        $('#results_wrapper > div ')
            .sort(function (div) {
               
                if ($(dlnrImg).prop('src') == $(".cgvDLNr", $(div)).prop('src'))
                    return -1;
                else
                    return 1;

            })
        .each(function () { $(this).appendTo('#results_wrapper'); });

    });

    function testavail() {
        WebSettings.GetString("ESHOP", "GRID_SORT");
    }

    /* LAZ - Rada Check promo availability */
    function Check_NewAddToCart(obj) {
        var isavailable = $('#isavailable').val();
        if (isavailable == 0) {
            var unavailableDescr = $('#isavailable').val();
            bootbox.alert(unavailableDescr);
        }
        else {
            NewAddToCart(obj);
            console.log(obj);
        }

    }

    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }