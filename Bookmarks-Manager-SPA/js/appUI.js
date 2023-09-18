//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
let selectedCategory = ""; // Ajout d'une variable pour stocker la catégorie sélectionnée
let trierCategorie="";
Init_UI();

function Init_UI() {
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#categories').on("click", async function () {
        renderBookmarks();
    });


}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de bookmarks</h2>
                <hr>
                <p>
                    Petite application de gestion de bookmarks à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Maurice Agboton
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await API_GetBookmarks();
    let categorie = [];
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
           
            if(trierCategorie != "" && bookmark.Categorie == trierCategorie)
            {
                $("#content").append(renderBookmark(bookmark));
            }
            else if(trierCategorie == "")
            {
                $("#content").append(renderBookmark(bookmark));
            }
            if (!categorie.includes(bookmark.Categorie)) {
                categorie.push(bookmark.Categorie);
            }
        }
        );
        afficherCategories(categorie,selectedCategory)
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $("#allCatCmd").on("click",function()
        {
            selectedCategory= "";
            trierCategorie= "";
            renderBookmarks();
        });
        $(".bookmarkRow").on("click", function (e) { });
        // lorsque une categorie clicked je veux reload bookmarks et je veux qui mettent dans une global ma categorie
        $(".selection").on("click",function()
        {
            selectedCategory = $(this).attr("id");
            trierCategorie = selectedCategory;
            renderBookmarks();
        });

    } 
    
    else {
        renderError("Service introuvable");
    }
}
function afficherCategories(categories, selectedCategory) {
    $("#categories").empty();
    categories = categories.forEach(element => {
        $("#categories").append(renderCategorie(element,element == selectedCategory));
    });

    return categories;
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await API_GetBookmark(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Bookmark introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le bookmark suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
                <div class="bookmarkContainer">
                    <div class="bookmarkLayout">
                        <div class="bookmarkTitle">${bookmark.Title}</div>
                        <div class="bookmarkUrl">${bookmark.Url}</div>
                        <div class="bookmarkCategorie">${bookmark.Categorie}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Bookmark introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Categorie = "";
    return bookmark;
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>

            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="url"
                required
                RequireMessage="Veuillez entrer un url" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${bookmark.Url}" 
            />
            <label for="Categorie" class="form-label">Categorie </label>
            <input 
                class="form-control Alpha"
                name="Categorie"
                id="Categorie"
                placeholder="Categorie"
                required
                RequireMessage="Veuillez entrer une categorie" 
                InvalidMessage="Veuillez entrer une categorie valide"
                value="${bookmark.Categorie}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    const $bookmark = $(`
        <div class="bookmarkRow" bookmark_id="${bookmark.Id}">
            <div class="bookmarkContainer noselect">
                <div class="bookmarkLayout">
                    <img src="https://www.google.com/s2/favicons?sz=32&domain=${bookmark.Url}" class="appLogo" alt="" title="">
                    <span class="bookmarkTitle">${bookmark.Title}</span>
                    <span class="bookmarkCategorie">${bookmark.Categorie}</span>
                </div>
                <div class="bookmarkCommandPanel">
                    <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                    <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
                </div>
            </div>
        </div>
    `);

    return $bookmark;
}
function renderCategorie(categorie,selectedCategory = false) {//1 param de plus
    //lambdapour afficher avec "menuIcon fa fa-fw mx-2 ou "menuIcon fa fa-check mx-2
    let cssCategorie = selectedCategory?"menuIcon fa fa-check mx-2":"menuIcon fa fa-fw mx-2"
    return (`<div class="dropdown-item selection" id="${categorie}">
    <i class="${cssCategorie}"></i> ${categorie}
</div>`);
}