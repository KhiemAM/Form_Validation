

function Validator(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    function Validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        var rules = selectorRules[rule.selector];
        
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
             getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
             getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return errorMessage;
    }

    var formElement = document.querySelector(options.form);
    if(formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector); 
                var isValid = Validate(inputElement, rule);
                if(isValid) {
                    isFormValid = false;
                }
            });

            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {

                    var enableInput = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(enableInput).reduce( (values, input) => {
                        switch (input.type) {
                        
                            case 'radio':
                                if(input.checked){
                                    values[input.name] = input.value;
                                }
                                if(!values[input.name]){
                                    values[input.name] = '';
                                }
                                break;

                            case 'checkbox':
                                if(!input.checked) { 
                                    return values 
                                }
                                if(!values[input.name]) {
                                    values[input.name] = ''
                                }
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                } 
                                values[input.name].push(input.value)
                                break;

                            case 'file':
                                values[input.name] = input.files;
                                break;

                            default:
                                values[input.name] = input.value;
                                break;
                        }

                        return values;
                    }, {})

                    options.onSubmit(formValues);
                }
                else {
                    formElement.submit();
                }
            }
        }

        options.rules.forEach(function(rule) {
            
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function(inputElement) {
                //Xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                    Validate(inputElement, rule);
                }

                //Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    var errorElement =  getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                     getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });
        });
    }
}

Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            if(typeof value === 'string') {
                return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
            }
            else {
                return value ? undefined : message || 'Vui lòng nhập trường này'
            }
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    }
}

Validator.minLenght = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}