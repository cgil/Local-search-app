angular.module('filters', [])
	.filter('deformat', function () {
		return function (formattedNumber) {
			if(!formattedNumber) {
				return null;	
			}
			return formattedNumber.replace(/[^0-9]/g,'');	
		}
	})
	
	.filter('truncate', function () {
        return function (text, length, end) {
			if(!text) {
				return	
			}
            if (isNaN(length)) {
                length = 30;
			}

            if (end === undefined) {
                end = "...";
			}

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });