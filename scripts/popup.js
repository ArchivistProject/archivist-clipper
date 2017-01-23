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

            // we get the returned data
        }

        // end of state change: it can be after some time (async)
    };
}

function getMetadataFields(){
    return ([
                { name: "Author", type: "text" },
                { name: "Title", type: "text" }
           ]);
}

function generateMetadataInput(metadataField){
    var inputTemplate = document.querySelector('#input-template');
    var label = inputTemplate.content.querySelector('label');
    var input = inputTemplate.content.querySelector('input');

    label.innerText = metadataField["name"];
    label.htmlFor = metadataField["id"];

    input.id = metadataField["id"];
    input.name = metadataField["name"];
    input.type = metadataField["type"];

    var clone = document.importNode(inputTemplate.content, true); // Deep copy of DOM

    return clone;
}

function generateMetadataInputs(metadataJson){
    var metadataInputs = [];

    metadataJson.forEach(function(metadataField){
       var id = metadataField.name.toLowerCase();
       metadataField["id"] = id;

        var fieldHtml = generateMetadataInput(metadataField);
        metadataInputs.push(fieldHtml);
    })

    return metadataInputs;
}

function addMetadataInputs(metadataInputs){
    var form = document.getElementById("metadata-form");

    for(var i = 0; i < metadataInputs.length; i++){
        form.insertBefore(metadataInputs[i], form.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Find button and add click event
    var savePageBtn = document.getElementById("save-page-btn");
    savePageBtn.addEventListener('click', click);

    // Generate and add input fields for HTML form
    var metadataFields = getMetadataFields();
    var metadataInputs = generateMetadataInputs(metadataFields);
    addMetadataInputs(metadataInputs);
});