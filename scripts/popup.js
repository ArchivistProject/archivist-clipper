function getFormData(){
    var formElements = document.getElementById('metadata-form').elements;
    var formData = {};

    for(var i = 0 ; i < formElements.length ; i++){
        var input = formElements[i];
        if( input.type != "button" ){
            formData[ input.name ] = input.value;
        }
    }

    return formData;
}

function postDataToApi( xhr, formData ){
    xhr.open("POST", "http://localhost:3000/public/documents", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    var data = JSON.stringify(formData)

    xhr.send(data);
}

function click(e) {
    var formData = getFormData();
    var xhr = new XMLHttpRequest();

    postDataToApi(xhr, formData);

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;

        if (this.status == 200) {
            var data = JSON.parse(this.responseText);
            alert(data);
            // we get the returned data
        }

        // end of state change: it can be after some time (async)
    };
}

document.addEventListener('DOMContentLoaded', function () {
    // Find button
    var savePageBtn = document.getElementById("save-page-btn");
    savePageBtn.addEventListener('click', click);

});