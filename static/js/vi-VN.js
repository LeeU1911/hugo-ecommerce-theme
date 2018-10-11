/**
 * Localization file for Vietnamese - Vietnam (vi-VN)
 */
(function(factory) {
    // Module systems magic dance.
    /*global require,ko.validation,define,module*/
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS or Node
        module.exports = factory(require('../'));
    } else if (typeof define === 'function' && define['amd']) {
        // AMD anonymous module with hard-coded dependency on 'knockout.validation'
        define(['knockout.validation'], factory);
    } else {
        // <script> tag: use the global `ko.validation` object
        factory(ko.validation);
    }
}(function(kv) {
    if (!kv || typeof kv.defineLocale !== 'function') {
        throw new Error('Knockout-Validation is required, please ensure it is loaded before this localization file');
    }
    return kv.defineLocale('vi-VN', {
        required: 'Vui lòng nhập thông tin.',
        min: 'Vui lòng nhập giá trị lớn hơn hoặc bằng {0}.',
        max: 'Vui lòng nhập giá trị nhỏ hơn hoặc bằng {0}.',
        minLength: 'Vui lòng nhập tối thiểu {0} ký tự.',
        maxLength: 'Vui lòng không nhập quá {0} ký tự.',
        pattern: 'Vui lòng kiểm tra lại giá trị.',
        step: 'Giá trị phải được tăng lên {0}.',
        email: 'Vui lòng nhập địa chỉ email hợp lệ.',
        date: 'Vui lòng nhập giá trị ngày hợp lệ.',
        dateISO: 'Vui lòng nhập giá trị ngày hợp lệ.',
        number: 'Vui lòng nhập số.',
        digit: 'Vui lòng nhập 1 chữ số.',
        phoneVN: 'Vui lòng nhập số điện thoại hợp lệ.',
        equal: 'Giá trị phải giống nhau.',
        notEqual: 'Vui lòng chọn giá trị khác.',
        unique: 'Vui lòng nhập giá trị độc nhất.'
    });
}));