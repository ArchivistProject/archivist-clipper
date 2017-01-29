function getFormData(){
    var formElements = $("#metadata-form").children("input:not(#save-page-btn)");

    var formData = {};

    formElements.each(function(){
        formData[ this.name ] = this.value;
    });

    return formData;
}

function postDataToApi( xhr, formData ){
    xhr.open("POST", "http://localhost:3000/public/documents", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    var data = JSON.stringify(formData);

    xhr.send(data);
}

function click() {
    var formData = getFormData();
    var xhr = new XMLHttpRequest();

    postDataToApi(xhr, formData);

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) {
            return;
        }

        if (this.status == 200) {
            var data = JSON.parse(this.responseText);

            // we get the returned data
        }

        // end of state change: it can be after some time (async)
    };
}

function getMetadataFields(){
    return ([
                { name: "Author", type: "string" },
                { name: "Title", type: "string" }
           ]);
}

function getInputType(apiType){
    switch( apiType ){
        case "string":
            return "text";
        case "date":
            return "date";
    }
}

function generateMetadataLabel(metadataField){
    return $("<label>" + metadataField["name"] + "</label>",
        {
            "htmlFor" : metadataField["id"]
        }
    );
}

function generateMetadataInput(metadataField){
    return $("<input />",
        {
            "id" : metadataField["id"],
            "name" : metadataField["name"],
            "type" : getInputType(metadataField["type"])
        }
    );
}

function generateMetadataInputs(metadataJson){
    var metadataInputs = [];

        metadataJson.forEach(function(metadataField){
            metadataField["id"] = metadataField.name.toLowerCase();

            var inputHtml = generateMetadataInput(metadataField);
            var labelHtml = generateMetadataLabel(metadataField);

            metadataInputs.push(inputHtml);
            metadataInputs.push(labelHtml);
        });

    return metadataInputs;
}

function addMetadataInputs(metadataInputs){
    var form = $("#metadata-form");

    metadataInputs.forEach(function(inputField){
        form.prepend(inputField);
    })
}

document.addEventListener('DOMContentLoaded', function () {
    // Find button and add click event
    var savePageBtn = $("#save-page-btn");
    savePageBtn.click(click);

    // Generate and add input fields for HTML form
    var metadataFields = getMetadataFields();
    var metadataInputs = generateMetadataInputs(metadataFields);
    addMetadataInputs(metadataInputs);
});
