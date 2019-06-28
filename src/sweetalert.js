Object.defineProperty(exports, "__esModule", {
  value: true
});

const Swal = require('sweetalert2');

exports.server_error = function (error) {
    var text = "Sorry, unexpected error.";
    if (error) {
        if (typeof(error) === "string") {
            text = error;
        } else if (error.message) {
            text = error.message;
        }
    }
    Swal.fire({
        text: text,
        type: 'error',
        toast: true,
        position: 'bottom-start',
        timer: 3000,
        showConfirmButton: false
    });
};

exports.success = function (message, title = null) {
    Swal.fire({
        title: title,
        text: message,
        type: 'success',
        confirmButtonClass: "alert-confirm-btn"
    });
};

exports.error = function (message, title = ':(') {
    Swal.fire({
        title: title,
        text: message,
        confirmButtonClass: "alert-confirm-btn"
    });
};

exports.confirm = function (message, onSelectFunction = null, canCloseWithoutChoose = false, title = 'Are you sure?', confirmButtonText = 'OK', cancelButtonText = 'Cancel') {
    Swal.fire({
        title: title,
        text: message,
        type: 'warning',
        showCancelButton: true,
        reverseButtons: true,
        allowEscapeKey: canCloseWithoutChoose,
        allowOutsideClick: canCloseWithoutChoose,
        allowEnterKey: canCloseWithoutChoose,
        confirmButtonClass: "alert-confirm-btn",
        cancelButtonClass: "alert-cancel-btn",
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
    }).then((result) => {
        if (onSelectFunction) {
            onSelectFunction(result && result.value);
        }
    });
};

