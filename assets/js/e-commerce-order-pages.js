$(function() {
    // Initialize copy button
    var clipboard = new Clipboard('#copyOrderContentBtn');

    clipboard.on('success', function (e) {
        setTooltip(e.trigger, 'Copied!');
        hideTooltip(e.trigger);
    });

    clipboard.on('error', function (e) {
        setTooltip(e.trigger, 'Failed!');
        hideTooltip(e.trigger);
    });
    // Tooltip

    $('#copyOrderContentBtn').tooltip({
        trigger: 'click',
        placement: 'bottom'
    });

    function setTooltip(btn, message) {
        $(btn).tooltip('hide')
            .attr('data-original-title', message)
            .tooltip('show');
    }

    function hideTooltip(btn) {
        setTimeout(function () {
            $(btn).tooltip('hide');
        }, 1000);
    }
});

function calculateTotalBillWithoutShippingCost(bill) {
    var products = getProductsArrayFromBill(bill);
    var subtotal = 0;
    for (var i = 0; i < products.length; i++) {
        subtotal += products[i].subtotal;
    }
    subtotal = applyDiscountOnTotal(subtotal, bill.discountPercent);
    subtotal = roundDownToThousand(subtotal);
    return subtotal;
}
function calculateTotalBillWithoutShippingCostWithoutDiscount(bill) {

    var products = getProductsArrayFromBill(bill);
    var subtotal = 0;
    for (var i = 0; i < products.length; i++) {
        subtotal += products[i].subtotal;
    }
    subtotal = roundDownToThousand(subtotal);
    return subtotal;
}

function calculateTotalBill(bill) {
    return bill.subtotal + bill.shippingCost;
}

function roundDownToThousand(value){
    return Math.floor(value/1000)*1000;
}

function applyDiscountOnTotal(subtotal, discountPercent) {
    if(discountPercent){
        return subtotal * (1 - (discountPercent / 100));
    }
    return subtotal;
}


//using array for displaying purpose. Let's see if array or object works better to be the data model in db
function getProductsArrayFromBill(b) {
    var products = b.products;
    return $.map(products, function (val, keyAmt) {
        if (keyAmt.substr(keyAmt.length - 3, keyAmt.length) == "Amt") {
            var sku = keyAmt.substr(0, keyAmt.length - 3);
            var price = products[sku + "Price"];
            return {name: sku, amount: val, price: price, subtotal: val * price};
        }
    });
}

function conformProductsArrayForAnalyticsPurpose(productsArr) {
    var conformedProductsArr = [];
    productsArr.forEach(function (prod) {
        conformedProductsArr.push({sku: prod.sku, name: prod.sku, price: prod.price, quantity: prod.amount})
    });
    return conformedProductsArr;
}

   var apiBaseURL = "https://api.dalafarm.vn";
// var apiBaseURL = "http://localhost:8080";

function getShippingCostNUpdateSubtotal(dropDistrictId, callback, weight) {
    var payload = { "pickupDistrictId": "772", "dropDistrictId": dropDistrictId, "weight": weight || 0};
    NProgress.start();
    $.ajax({
        type: 'POST',
        url: apiBaseURL + "/v1/logistic/shipping-fee",
        data: JSON.stringify(payload),
        success: function(data) { if(data.success) {//{"success":true,"message":"Able to deliver this package","totalFee":45000,"vendorId":1}
            callback(data.totalFee, data.vendorId);
        }else{
            alert(data.message);
        }},
        contentType: "application/json",
        dataType: 'json'
    }).fail(function(error) {
        alert(JSON.stringify(error));
    }).always(function () {
        NProgress.done();

    });
}

function lookupPlaceIdFromName(availablePlaces, placeName){
    return availablePlaces.filter(function(p) {
        return p.name === placeName;
    })[0].id;
}

function calculateWeightOfPowders(bill) {
    var weight = 0;
    var products = bill.products;
    for (var property in products) {
        if (products.hasOwnProperty(property)) {
            if (property.substr(property.length - 3, property.length) == "Amt" && products[property] > 0) {
                weight += 50 * products[property];
                if (property.indexOf("100") > -1 || property.indexOf("detox") > -1) {
                    if(property.indexOf("combodetox") > -1){
                        weight += 250 * products[property];
                    }else {
                        weight += 50 * products[property];
                    }
                }
                if(property.indexOf("garlicoil") > -1) {
                    weight += 720 * products[property];
                }
                if(property.indexOf("dalababy") > -1) {
                    weight += 20 * products[property];
                }

            }
        }
    }
    console.log("Weight is " + weight);
    return weight;
}

function calculateWeightOfPowdersForPromotionPurpose(bill) {
    var weight = 0;
    var products = bill.products;
    for (var property in products) {
        if (products.hasOwnProperty(property)) {
            if (property.substr(property.length - 3, property.length) == "Amt" && products[property] > 0) {
                weight += 50 * products[property];
                if (property.indexOf("100") > -1 || property.indexOf("detox") > -1) {
                    if(property.indexOf("combodetox") > -1){
                        weight += 250 * products[property];
                    }else {
                        weight += 50 * products[property];
                    }
                }
                if(property.indexOf("garlicoil") > -1) {
                    weight += 0 * products[property];
                }
                if(property.indexOf("dalababy") > -1) {
                    weight += 20 * products[property];
                }

            }
        }
    }
    console.log("Weight is " + weight);
    return weight;
}

function applyPromotion(bill){
    var totalBillWoShippingCost = calculateTotalBillWithoutShippingCost(bill);
    bill.subtotal = totalBillWoShippingCost;
	// if(bill.promoCode !== undefined && bill.promoCode !== "") {
        // alert("Lưu ý: Nếu muốn hưởng chương trình khuyến mãi trên hệ thống, bạn cần gỡ bỏ mã khuyến mãi đang dùng " + bill.promoCode + ".");
        // return bill;
    // }
	if(bill.promoCode !== undefined && (bill.promoCode === "FREESHIPDALAT" || bill.promoCode === "E484FT")) {
		bill.freeShip = true;
		return bill;
	}
    bill.promotionalProducts = {};
    var weight = calculateWeightOfPowdersForPromotionPurpose(bill);
    // if(weight >= 500 && only50gPowdersInOrder(bill)) {
    //     bill.freeShip = true;
    //     bill.products['dalababyAmt']++;
    //     bill.promotionalProducts['dalababyAmt'] = 1;
    //     return bill;
    // }
    // if(weight >= 300){
        // bill.freeShip = true;
    // }

    // if(totalBillWoShippingCost >= 250000){
    //     bill.freeShip = true;
    // }

    // if(totalBillWoShippingCost > 580000) {
    //     bill.freeShip = true;
    //     return bill;
    // }
    // var numberOfComboDetox2 = numberOfComboDetox(bill);
    // if(numberOfComboDetox2 > 0) {
    //     bill.freeShip = true;
    //     // bill.promotionalProducts['mooncakeAmt'] = numberOfComboDetox2;
    // }

    return bill;
}
function numberOfComboDetox(bill) {
    var products = bill.products;
    for (var property in products) {
        if (products.hasOwnProperty(property)) {
            if (property.substr(property.length - 3, property.length) == "Amt" && products[property] > 0) {
                if (property.indexOf("combodetox") > -1) {
                    return products[property];
                }
            }
        }
    }
    return 0;
}
function only50gPowdersInOrder(bill){
    var products = bill.products;
    var numOf50gPowder = 0;
    for (var property in products) {
        if (products.hasOwnProperty(property)) {
            if (property.substr(property.length - 3, property.length) == "Amt" && products[property] > 0) {
                if (!(property.indexOf("detox") > -1 || property.indexOf("dalababy") > -1 || property.indexOf("garlicoil") > -1)) {
                    numOf50gPowder += products[property];
                }
            }
        }
    }
    return numOf50gPowder >= 10;

}
function isEmptyCart(bill) {
    var products = bill.products;
    for (var property in products) {
        if (products.hasOwnProperty(property)) {
            if (property.substr(property.length - 3, property.length) == "Amt" && products[property] > 0) {
                return false;
            }
        }
    }
    return true;
}

// Utility methods
Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

function humanizeProductName(productKey) {
    if (productKey) {
        switch (productKey) {
            case "carrot":
                return "Bột cà rốt 50g";
            case "beetroot":
                return "Bột củ dền 50g";
            case "broccoli":
                return "Bột súp lơ xanh 50g";
            case "cocoa100":
                return "Bột ca cao 100g";
            case "heartleaf100":
                return "Bột rau diếp cá 100g";
            case "heartleaf":
                return "Bột rau diếp cá 50g";
            case "matcha100":
                return "Bột trà xanh 100g";
            case "matcha":
                return "Bột trà xanh 50g";
            case "moringa":
                return "Bột chùm ngây 50g";
            case "pennywort":
                return "Bột rau má 50g";
            case "pennywort100":
                return "Bột rau má 100g";
            case "pumpkin":
                return "Bột bí đỏ 50g";
            case "tomato":
                return "Bột cà chua 50g";
            case "lotus":
                return "Bột hạt sen 50g";
            case "purpleswpotato":
                return "Bột khoai lang tím 50g";
            case "spinach":
                return "Bột rau bó xôi 50g";
            case "mushroom":
                return "Bột nấm 50g";
            case "garlicoil":
                return "Dầu tỏi tía Đà Lạt 250ml";
            case "dalababy":
                return "Bột rau củ DalaBaby 70g";
            case "garlicwine":
                return "Rượu tỏi đen 750ml";
            case "garlichoney":
                return "Mật ong tỏi đen 50g";
            case "sundetox":
                return "Bột detox đỏ Sun Powder 100g";
            case "moondetox":
                return "Bột detox xanh Moon Powder 100g";
            case "stardetox":
                return "Bột detox vàng Star Powder 100g";
            case "combodetox":
                return "Combo Bộ 3 Detox Thải Độc Toàn Diện (300g)";
            case "carrot5g":
                return "Bột cà rốt 5g";
            case "pumpkin5g":
                return "Bột bí đỏ 5g";
            case "broccoli5g":
                return "Bột súp lơ xanh 5g";
            case "mushroom5g":
                return "Bột nấm bào ngư xám 5g";
            case "lotus5g":
                return "Bột hạt sen 5g";
            case "spinach5g":
                return "Bột rau bó xôi 5g";
            case "purpleswpotato5g":
                return "Bột khoai lang tím 5g";
            default:
                return productKey;
        }

    }
}

function humanizePaymentType(paymentType) {
    if(paymentType){
        switch (paymentType) {
            case "cod": return "Thanh toán lúc nhận hàng (COD)";
            case "bank-transfer": return "Chuyển khoản ngân hàng";
        }

    }
}

var Latinise = {};
Latinise.latin_map = {
    "Á": "A",
    "Ă": "A",
    "Ắ": "A",
    "Ặ": "A",
    "Ằ": "A",
    "Ẳ": "A",
    "Ẵ": "A",
    "Ǎ": "A",
    "Â": "A",
    "Ấ": "A",
    "Ậ": "A",
    "Ầ": "A",
    "Ẩ": "A",
    "Ẫ": "A",
    "Ä": "A",
    "Ǟ": "A",
    "Ȧ": "A",
    "Ǡ": "A",
    "Ạ": "A",
    "Ȁ": "A",
    "À": "A",
    "Ả": "A",
    "Ȃ": "A",
    "Ā": "A",
    "Ą": "A",
    "Å": "A",
    "Ǻ": "A",
    "Ḁ": "A",
    "Ⱥ": "A",
    "Ã": "A",
    "Ꜳ": "AA",
    "Æ": "AE",
    "Ǽ": "AE",
    "Ǣ": "AE",
    "Ꜵ": "AO",
    "Ꜷ": "AU",
    "Ꜹ": "AV",
    "Ꜻ": "AV",
    "Ꜽ": "AY",
    "Ḃ": "B",
    "Ḅ": "B",
    "Ɓ": "B",
    "Ḇ": "B",
    "Ƀ": "B",
    "Ƃ": "B",
    "Ć": "C",
    "Č": "C",
    "Ç": "C",
    "Ḉ": "C",
    "Ĉ": "C",
    "Ċ": "C",
    "Ƈ": "C",
    "Ȼ": "C",
    "Ď": "D",
    "Ḑ": "D",
    "Ḓ": "D",
    "Ḋ": "D",
    "Ḍ": "D",
    "Ɗ": "D",
    "Ḏ": "D",
    "ǲ": "D",
    "ǅ": "D",
    "Đ": "D",
    "Ƌ": "D",
    "Ǳ": "DZ",
    "Ǆ": "DZ",
    "É": "E",
    "Ĕ": "E",
    "Ě": "E",
    "Ȩ": "E",
    "Ḝ": "E",
    "Ê": "E",
    "Ế": "E",
    "Ệ": "E",
    "Ề": "E",
    "Ể": "E",
    "Ễ": "E",
    "Ḙ": "E",
    "Ë": "E",
    "Ė": "E",
    "Ẹ": "E",
    "Ȅ": "E",
    "È": "E",
    "Ẻ": "E",
    "Ȇ": "E",
    "Ē": "E",
    "Ḗ": "E",
    "Ḕ": "E",
    "Ę": "E",
    "Ɇ": "E",
    "Ẽ": "E",
    "Ḛ": "E",
    "Ꝫ": "ET",
    "Ḟ": "F",
    "Ƒ": "F",
    "Ǵ": "G",
    "Ğ": "G",
    "Ǧ": "G",
    "Ģ": "G",
    "Ĝ": "G",
    "Ġ": "G",
    "Ɠ": "G",
    "Ḡ": "G",
    "Ǥ": "G",
    "Ḫ": "H",
    "Ȟ": "H",
    "Ḩ": "H",
    "Ĥ": "H",
    "Ⱨ": "H",
    "Ḧ": "H",
    "Ḣ": "H",
    "Ḥ": "H",
    "Ħ": "H",
    "Í": "I",
    "Ĭ": "I",
    "Ǐ": "I",
    "Î": "I",
    "Ï": "I",
    "Ḯ": "I",
    "İ": "I",
    "Ị": "I",
    "Ȉ": "I",
    "Ì": "I",
    "Ỉ": "I",
    "Ȋ": "I",
    "Ī": "I",
    "Į": "I",
    "Ɨ": "I",
    "Ĩ": "I",
    "Ḭ": "I",
    "Ꝺ": "D",
    "Ꝼ": "F",
    "Ᵹ": "G",
    "Ꞃ": "R",
    "Ꞅ": "S",
    "Ꞇ": "T",
    "Ꝭ": "IS",
    "Ĵ": "J",
    "Ɉ": "J",
    "Ḱ": "K",
    "Ǩ": "K",
    "Ķ": "K",
    "Ⱪ": "K",
    "Ꝃ": "K",
    "Ḳ": "K",
    "Ƙ": "K",
    "Ḵ": "K",
    "Ꝁ": "K",
    "Ꝅ": "K",
    "Ĺ": "L",
    "Ƚ": "L",
    "Ľ": "L",
    "Ļ": "L",
    "Ḽ": "L",
    "Ḷ": "L",
    "Ḹ": "L",
    "Ⱡ": "L",
    "Ꝉ": "L",
    "Ḻ": "L",
    "Ŀ": "L",
    "Ɫ": "L",
    "ǈ": "L",
    "Ł": "L",
    "Ǉ": "LJ",
    "Ḿ": "M",
    "Ṁ": "M",
    "Ṃ": "M",
    "Ɱ": "M",
    "Ń": "N",
    "Ň": "N",
    "Ņ": "N",
    "Ṋ": "N",
    "Ṅ": "N",
    "Ṇ": "N",
    "Ǹ": "N",
    "Ɲ": "N",
    "Ṉ": "N",
    "Ƞ": "N",
    "ǋ": "N",
    "Ñ": "N",
    "Ǌ": "NJ",
    "Ó": "O",
    "Ŏ": "O",
    "Ǒ": "O",
    "Ô": "O",
    "Ố": "O",
    "Ộ": "O",
    "Ồ": "O",
    "Ổ": "O",
    "Ỗ": "O",
    "Ö": "O",
    "Ȫ": "O",
    "Ȯ": "O",
    "Ȱ": "O",
    "Ọ": "O",
    "Ő": "O",
    "Ȍ": "O",
    "Ò": "O",
    "Ỏ": "O",
    "Ơ": "O",
    "Ớ": "O",
    "Ợ": "O",
    "Ờ": "O",
    "Ở": "O",
    "Ỡ": "O",
    "Ȏ": "O",
    "Ꝋ": "O",
    "Ꝍ": "O",
    "Ō": "O",
    "Ṓ": "O",
    "Ṑ": "O",
    "Ɵ": "O",
    "Ǫ": "O",
    "Ǭ": "O",
    "Ø": "O",
    "Ǿ": "O",
    "Õ": "O",
    "Ṍ": "O",
    "Ṏ": "O",
    "Ȭ": "O",
    "Ƣ": "OI",
    "Ꝏ": "OO",
    "Ɛ": "E",
    "Ɔ": "O",
    "Ȣ": "OU",
    "Ṕ": "P",
    "Ṗ": "P",
    "Ꝓ": "P",
    "Ƥ": "P",
    "Ꝕ": "P",
    "Ᵽ": "P",
    "Ꝑ": "P",
    "Ꝙ": "Q",
    "Ꝗ": "Q",
    "Ŕ": "R",
    "Ř": "R",
    "Ŗ": "R",
    "Ṙ": "R",
    "Ṛ": "R",
    "Ṝ": "R",
    "Ȑ": "R",
    "Ȓ": "R",
    "Ṟ": "R",
    "Ɍ": "R",
    "Ɽ": "R",
    "Ꜿ": "C",
    "Ǝ": "E",
    "Ś": "S",
    "Ṥ": "S",
    "Š": "S",
    "Ṧ": "S",
    "Ş": "S",
    "Ŝ": "S",
    "Ș": "S",
    "Ṡ": "S",
    "Ṣ": "S",
    "Ṩ": "S",
    "Ť": "T",
    "Ţ": "T",
    "Ṱ": "T",
    "Ț": "T",
    "Ⱦ": "T",
    "Ṫ": "T",
    "Ṭ": "T",
    "Ƭ": "T",
    "Ṯ": "T",
    "Ʈ": "T",
    "Ŧ": "T",
    "Ɐ": "A",
    "Ꞁ": "L",
    "Ɯ": "M",
    "Ʌ": "V",
    "Ꜩ": "TZ",
    "Ú": "U",
    "Ŭ": "U",
    "Ǔ": "U",
    "Û": "U",
    "Ṷ": "U",
    "Ü": "U",
    "Ǘ": "U",
    "Ǚ": "U",
    "Ǜ": "U",
    "Ǖ": "U",
    "Ṳ": "U",
    "Ụ": "U",
    "Ű": "U",
    "Ȕ": "U",
    "Ù": "U",
    "Ủ": "U",
    "Ư": "U",
    "Ứ": "U",
    "Ự": "U",
    "Ừ": "U",
    "Ử": "U",
    "Ữ": "U",
    "Ȗ": "U",
    "Ū": "U",
    "Ṻ": "U",
    "Ų": "U",
    "Ů": "U",
    "Ũ": "U",
    "Ṹ": "U",
    "Ṵ": "U",
    "Ꝟ": "V",
    "Ṿ": "V",
    "Ʋ": "V",
    "Ṽ": "V",
    "Ꝡ": "VY",
    "Ẃ": "W",
    "Ŵ": "W",
    "Ẅ": "W",
    "Ẇ": "W",
    "Ẉ": "W",
    "Ẁ": "W",
    "Ⱳ": "W",
    "Ẍ": "X",
    "Ẋ": "X",
    "Ý": "Y",
    "Ŷ": "Y",
    "Ÿ": "Y",
    "Ẏ": "Y",
    "Ỵ": "Y",
    "Ỳ": "Y",
    "Ƴ": "Y",
    "Ỷ": "Y",
    "Ỿ": "Y",
    "Ȳ": "Y",
    "Ɏ": "Y",
    "Ỹ": "Y",
    "Ź": "Z",
    "Ž": "Z",
    "Ẑ": "Z",
    "Ⱬ": "Z",
    "Ż": "Z",
    "Ẓ": "Z",
    "Ȥ": "Z",
    "Ẕ": "Z",
    "Ƶ": "Z",
    "Ĳ": "IJ",
    "Œ": "OE",
    "ᴀ": "A",
    "ᴁ": "AE",
    "ʙ": "B",
    "ᴃ": "B",
    "ᴄ": "C",
    "ᴅ": "D",
    "ᴇ": "E",
    "ꜰ": "F",
    "ɢ": "G",
    "ʛ": "G",
    "ʜ": "H",
    "ɪ": "I",
    "ʁ": "R",
    "ᴊ": "J",
    "ᴋ": "K",
    "ʟ": "L",
    "ᴌ": "L",
    "ᴍ": "M",
    "ɴ": "N",
    "ᴏ": "O",
    "ɶ": "OE",
    "ᴐ": "O",
    "ᴕ": "OU",
    "ᴘ": "P",
    "ʀ": "R",
    "ᴎ": "N",
    "ᴙ": "R",
    "ꜱ": "S",
    "ᴛ": "T",
    "ⱻ": "E",
    "ᴚ": "R",
    "ᴜ": "U",
    "ᴠ": "V",
    "ᴡ": "W",
    "ʏ": "Y",
    "ᴢ": "Z",
    "á": "a",
    "ă": "a",
    "ắ": "a",
    "ặ": "a",
    "ằ": "a",
    "ẳ": "a",
    "ẵ": "a",
    "ǎ": "a",
    "â": "a",
    "ấ": "a",
    "ậ": "a",
    "ầ": "a",
    "ẩ": "a",
    "ẫ": "a",
    "ä": "a",
    "ǟ": "a",
    "ȧ": "a",
    "ǡ": "a",
    "ạ": "a",
    "ȁ": "a",
    "à": "a",
    "ả": "a",
    "ȃ": "a",
    "ā": "a",
    "ą": "a",
    "ᶏ": "a",
    "ẚ": "a",
    "å": "a",
    "ǻ": "a",
    "ḁ": "a",
    "ⱥ": "a",
    "ã": "a",
    "ꜳ": "aa",
    "æ": "ae",
    "ǽ": "ae",
    "ǣ": "ae",
    "ꜵ": "ao",
    "ꜷ": "au",
    "ꜹ": "av",
    "ꜻ": "av",
    "ꜽ": "ay",
    "ḃ": "b",
    "ḅ": "b",
    "ɓ": "b",
    "ḇ": "b",
    "ᵬ": "b",
    "ᶀ": "b",
    "ƀ": "b",
    "ƃ": "b",
    "ɵ": "o",
    "ć": "c",
    "č": "c",
    "ç": "c",
    "ḉ": "c",
    "ĉ": "c",
    "ɕ": "c",
    "ċ": "c",
    "ƈ": "c",
    "ȼ": "c",
    "ď": "d",
    "ḑ": "d",
    "ḓ": "d",
    "ȡ": "d",
    "ḋ": "d",
    "ḍ": "d",
    "ɗ": "d",
    "ᶑ": "d",
    "ḏ": "d",
    "ᵭ": "d",
    "ᶁ": "d",
    "đ": "d",
    "ɖ": "d",
    "ƌ": "d",
    "ı": "i",
    "ȷ": "j",
    "ɟ": "j",
    "ʄ": "j",
    "ǳ": "dz",
    "ǆ": "dz",
    "é": "e",
    "ĕ": "e",
    "ě": "e",
    "ȩ": "e",
    "ḝ": "e",
    "ê": "e",
    "ế": "e",
    "ệ": "e",
    "ề": "e",
    "ể": "e",
    "ễ": "e",
    "ḙ": "e",
    "ë": "e",
    "ė": "e",
    "ẹ": "e",
    "ȅ": "e",
    "è": "e",
    "ẻ": "e",
    "ȇ": "e",
    "ē": "e",
    "ḗ": "e",
    "ḕ": "e",
    "ⱸ": "e",
    "ę": "e",
    "ᶒ": "e",
    "ɇ": "e",
    "ẽ": "e",
    "ḛ": "e",
    "ꝫ": "et",
    "ḟ": "f",
    "ƒ": "f",
    "ᵮ": "f",
    "ᶂ": "f",
    "ǵ": "g",
    "ğ": "g",
    "ǧ": "g",
    "ģ": "g",
    "ĝ": "g",
    "ġ": "g",
    "ɠ": "g",
    "ḡ": "g",
    "ᶃ": "g",
    "ǥ": "g",
    "ḫ": "h",
    "ȟ": "h",
    "ḩ": "h",
    "ĥ": "h",
    "ⱨ": "h",
    "ḧ": "h",
    "ḣ": "h",
    "ḥ": "h",
    "ɦ": "h",
    "ẖ": "h",
    "ħ": "h",
    "ƕ": "hv",
    "í": "i",
    "ĭ": "i",
    "ǐ": "i",
    "î": "i",
    "ï": "i",
    "ḯ": "i",
    "ị": "i",
    "ȉ": "i",
    "ì": "i",
    "ỉ": "i",
    "ȋ": "i",
    "ī": "i",
    "į": "i",
    "ᶖ": "i",
    "ɨ": "i",
    "ĩ": "i",
    "ḭ": "i",
    "ꝺ": "d",
    "ꝼ": "f",
    "ᵹ": "g",
    "ꞃ": "r",
    "ꞅ": "s",
    "ꞇ": "t",
    "ꝭ": "is",
    "ǰ": "j",
    "ĵ": "j",
    "ʝ": "j",
    "ɉ": "j",
    "ḱ": "k",
    "ǩ": "k",
    "ķ": "k",
    "ⱪ": "k",
    "ꝃ": "k",
    "ḳ": "k",
    "ƙ": "k",
    "ḵ": "k",
    "ᶄ": "k",
    "ꝁ": "k",
    "ꝅ": "k",
    "ĺ": "l",
    "ƚ": "l",
    "ɬ": "l",
    "ľ": "l",
    "ļ": "l",
    "ḽ": "l",
    "ȴ": "l",
    "ḷ": "l",
    "ḹ": "l",
    "ⱡ": "l",
    "ꝉ": "l",
    "ḻ": "l",
    "ŀ": "l",
    "ɫ": "l",
    "ᶅ": "l",
    "ɭ": "l",
    "ł": "l",
    "ǉ": "lj",
    "ſ": "s",
    "ẜ": "s",
    "ẛ": "s",
    "ẝ": "s",
    "ḿ": "m",
    "ṁ": "m",
    "ṃ": "m",
    "ɱ": "m",
    "ᵯ": "m",
    "ᶆ": "m",
    "ń": "n",
    "ň": "n",
    "ņ": "n",
    "ṋ": "n",
    "ȵ": "n",
    "ṅ": "n",
    "ṇ": "n",
    "ǹ": "n",
    "ɲ": "n",
    "ṉ": "n",
    "ƞ": "n",
    "ᵰ": "n",
    "ᶇ": "n",
    "ɳ": "n",
    "ñ": "n",
    "ǌ": "nj",
    "ó": "o",
    "ŏ": "o",
    "ǒ": "o",
    "ô": "o",
    "ố": "o",
    "ộ": "o",
    "ồ": "o",
    "ổ": "o",
    "ỗ": "o",
    "ö": "o",
    "ȫ": "o",
    "ȯ": "o",
    "ȱ": "o",
    "ọ": "o",
    "ő": "o",
    "ȍ": "o",
    "ò": "o",
    "ỏ": "o",
    "ơ": "o",
    "ớ": "o",
    "ợ": "o",
    "ờ": "o",
    "ở": "o",
    "ỡ": "o",
    "ȏ": "o",
    "ꝋ": "o",
    "ꝍ": "o",
    "ⱺ": "o",
    "ō": "o",
    "ṓ": "o",
    "ṑ": "o",
    "ǫ": "o",
    "ǭ": "o",
    "ø": "o",
    "ǿ": "o",
    "õ": "o",
    "ṍ": "o",
    "ṏ": "o",
    "ȭ": "o",
    "ƣ": "oi",
    "ꝏ": "oo",
    "ɛ": "e",
    "ᶓ": "e",
    "ɔ": "o",
    "ᶗ": "o",
    "ȣ": "ou",
    "ṕ": "p",
    "ṗ": "p",
    "ꝓ": "p",
    "ƥ": "p",
    "ᵱ": "p",
    "ᶈ": "p",
    "ꝕ": "p",
    "ᵽ": "p",
    "ꝑ": "p",
    "ꝙ": "q",
    "ʠ": "q",
    "ɋ": "q",
    "ꝗ": "q",
    "ŕ": "r",
    "ř": "r",
    "ŗ": "r",
    "ṙ": "r",
    "ṛ": "r",
    "ṝ": "r",
    "ȑ": "r",
    "ɾ": "r",
    "ᵳ": "r",
    "ȓ": "r",
    "ṟ": "r",
    "ɼ": "r",
    "ᵲ": "r",
    "ᶉ": "r",
    "ɍ": "r",
    "ɽ": "r",
    "ↄ": "c",
    "ꜿ": "c",
    "ɘ": "e",
    "ɿ": "r",
    "ś": "s",
    "ṥ": "s",
    "š": "s",
    "ṧ": "s",
    "ş": "s",
    "ŝ": "s",
    "ș": "s",
    "ṡ": "s",
    "ṣ": "s",
    "ṩ": "s",
    "ʂ": "s",
    "ᵴ": "s",
    "ᶊ": "s",
    "ȿ": "s",
    "ɡ": "g",
    "ᴑ": "o",
    "ᴓ": "o",
    "ᴝ": "u",
    "ť": "t",
    "ţ": "t",
    "ṱ": "t",
    "ț": "t",
    "ȶ": "t",
    "ẗ": "t",
    "ⱦ": "t",
    "ṫ": "t",
    "ṭ": "t",
    "ƭ": "t",
    "ṯ": "t",
    "ᵵ": "t",
    "ƫ": "t",
    "ʈ": "t",
    "ŧ": "t",
    "ᵺ": "th",
    "ɐ": "a",
    "ᴂ": "ae",
    "ǝ": "e",
    "ᵷ": "g",
    "ɥ": "h",
    "ʮ": "h",
    "ʯ": "h",
    "ᴉ": "i",
    "ʞ": "k",
    "ꞁ": "l",
    "ɯ": "m",
    "ɰ": "m",
    "ᴔ": "oe",
    "ɹ": "r",
    "ɻ": "r",
    "ɺ": "r",
    "ⱹ": "r",
    "ʇ": "t",
    "ʌ": "v",
    "ʍ": "w",
    "ʎ": "y",
    "ꜩ": "tz",
    "ú": "u",
    "ŭ": "u",
    "ǔ": "u",
    "û": "u",
    "ṷ": "u",
    "ü": "u",
    "ǘ": "u",
    "ǚ": "u",
    "ǜ": "u",
    "ǖ": "u",
    "ṳ": "u",
    "ụ": "u",
    "ű": "u",
    "ȕ": "u",
    "ù": "u",
    "ủ": "u",
    "ư": "u",
    "ứ": "u",
    "ự": "u",
    "ừ": "u",
    "ử": "u",
    "ữ": "u",
    "ȗ": "u",
    "ū": "u",
    "ṻ": "u",
    "ų": "u",
    "ᶙ": "u",
    "ů": "u",
    "ũ": "u",
    "ṹ": "u",
    "ṵ": "u",
    "ᵫ": "ue",
    "ꝸ": "um",
    "ⱴ": "v",
    "ꝟ": "v",
    "ṿ": "v",
    "ʋ": "v",
    "ᶌ": "v",
    "ⱱ": "v",
    "ṽ": "v",
    "ꝡ": "vy",
    "ẃ": "w",
    "ŵ": "w",
    "ẅ": "w",
    "ẇ": "w",
    "ẉ": "w",
    "ẁ": "w",
    "ⱳ": "w",
    "ẘ": "w",
    "ẍ": "x",
    "ẋ": "x",
    "ᶍ": "x",
    "ý": "y",
    "ŷ": "y",
    "ÿ": "y",
    "ẏ": "y",
    "ỵ": "y",
    "ỳ": "y",
    "ƴ": "y",
    "ỷ": "y",
    "ỿ": "y",
    "ȳ": "y",
    "ẙ": "y",
    "ɏ": "y",
    "ỹ": "y",
    "ź": "z",
    "ž": "z",
    "ẑ": "z",
    "ʑ": "z",
    "ⱬ": "z",
    "ż": "z",
    "ẓ": "z",
    "ȥ": "z",
    "ẕ": "z",
    "ᵶ": "z",
    "ᶎ": "z",
    "ʐ": "z",
    "ƶ": "z",
    "ɀ": "z",
    "ﬀ": "ff",
    "ﬃ": "ffi",
    "ﬄ": "ffl",
    "ﬁ": "fi",
    "ﬂ": "fl",
    "ĳ": "ij",
    "œ": "oe",
    "ﬆ": "st",
    "ₐ": "a",
    "ₑ": "e",
    "ᵢ": "i",
    "ⱼ": "j",
    "ₒ": "o",
    "ᵣ": "r",
    "ᵤ": "u",
    "ᵥ": "v",
    "ₓ": "x"
};
String.prototype.latinise = function () {
    return this.replace(/[^A-Za-z0-9\[\] ]/g, function (a) {
        return Latinise.latin_map[a] || a
    })
};
String.prototype.latinize = String.prototype.latinise;
String.prototype.isLatin = function () {
    return this == this.latinise()
}
