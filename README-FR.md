
# Spécifications relatives au développement de modules de formation sur My Training Platform

- Généralités
- Structuration d'un module
- Cas particulier d'un module SCORM
- Communication avec le LMS

## Généralités

Le LMS tourne sous un système UNIX et les assets (dont les modules), sont hébergés sur AWS S3.

Les fichiers sont donc `case-sensitive` et doivent respecter les normes du web (pas de charactères spéciaux, pas d'espaces et pas de majuscules). Cf https://ed.fnal.gov/lincon/tech_web_naming.shtml

Le contenu des fichiers peut être minifié pour optimiser les performances d'affichage.

A l'intérieur du LMS le module est rendu dans une iframe à 100% de largeur et de hauteur, avec un burger menu en haut à gauche.

Les 50 pixels haut gauche ne doivent pas être utilisés, ils seraient recouverts par le burger.


## Structuration d'un module

Le module doit être livré sous forme d'une archive ZIP, sans mot de passe.

Les fichiers composant le module peuvent être hierarchiques, et comprendre autant de dossiers et sous-dossiers nécessaires.

Les inclusions de fichiers doivent utiliser des chemins relatifs.

Le premier fichier html doit impérativement s'appeler `index.html` et doit être à la racine du module

ATTENTION : vous devez compresser le contenu en partant de la racine du site (de l'index.html) et pas en partant d'un niveau au dessus. Cela signifie que si vous rangez vos fichier dans un dossier de projet vous ne devez pas compresser le dossier du projet mais bien les fichiers à l'intérieur de celui-ci.

Toutes les ressources nécessaires au bon fonctionnement du module doivent être inclues à l'intérieur de celui-ci. Pas d'appel HTTP extérieur.


## Cas particulier d'un module SCORM

Le LMS intégre le standard SCORM 2004 et les modules peuvent en bénéficier.

Dans le cas d'un module scorm le premier fichier n'est pas nécessairement nommé index.html mais il doit être précisé dans le manifest (lmsmanifest.xml).

Il est conseillé d'utiliser un wrapper d'API, comme celui disponible ici : https://github.com/pipwerks/scorm-api-wrapper/blob/master/src/JavaScript/SCORM_API_wrapper.js


Exemple de code pour se connecter au LMS

```javascript

var scorm = pipwerks.SCORM;  //Shortcut
var scormStartTime = (new Date()).getTime();
var lmsConnected = false;

/*
 * Utils
 */
function handleError(msg) {
  // how you want to handle error, for example "alert"
}

/*
 * Connection managment
 */
function connectToLMS() {
  // scorm.init returns a boolean
  lmsConnected = scorm.init();

  // If the course couldn't connect to the LMS for some reason...
  if (lmsConnected == false) {
    // add a body class
    var a = document.body;
    a.classList ? a.classList.add('no-lms') : a.className += ' no-lms';
    // ... let's alert the user
    handleError("Error: Course could not connect with the LMS");
  }
}

function disconnectFromLMS() {
  // If the lmsConnection is active...
  if (lmsConnected) {
    // Log session time
    var now = (new Date()).getTime();
    var milliseconds = now - scormStartTime;
    var seconds = Math.round(milliseconds/1000);
    var interval = 'PT' + seconds + 'S';
    var success = scorm.set('cmi.session_time', interval);
    // If the value wasn't successfully set...
    if (!success) {
       // ... let's alert the user
       handleError("Error: Session Time could not be set");
    }
    scorm.quit();
    lmsConnected = false;
  }
}

window.onload = connectToLMS;
window.onunload = disconnectFromLMS;

```

Une fois connecté il est possible d'obtenir des valeurs depuis le lms ou d'en attribuer en utilisant scorm.set(key, value) ou scorm.get(key)

## Communication avec les fonctionnalités spécifiques du LMS

Il est possible d'interagir avec le LMS pour marquer le module comme complété, noter un score et/ou poster dans la communauté.

Nous mettons à disposition le fichier `mtp_lms.js` qui permet de faire l'interface entre le LMS et votre module.

Il est disponible ici : https://github.com/semiodesign/MTP_LMS

Deux méthodes sont disponibles :

> `createCommunityPost` prend un objet en variable. Cet objet peut avoir pour propriétés :

- `community_group_id`, integer, optionnel
  - Si le `community_group_id` n'est pas renseigné, le post est alors créé sur le profil de l'utilisateur et est visible par ses amis.
  - Dans le cas d'un `community_group_id` renseigné, le post est alors rattaché au groupe concerné.
- `content`, string, optionnel
  - Le contenu texte du post qui s'affichera dans la communauté.
- `image`, string, optionnel
  - Une image liée au post. Elle doit d'être passé en string base64.
  - Nous conseillons l'utilisation de toDataURL() (cf: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) pour réaliser l'opération.
- `video`, string, optionnel
  - Une vidéo liée au post. Elle doit d'être passé en tant qu'URL MP4.
- `callback`, function, optionnel
  - Le nom de la fonction qui traitera les informations retounées par le LMS.

> `moduleWon` prend un objet en variable. Cet objet peut avoir pour propriétés :

- `success`, boolean, requis
  - Enregistre le module comme réussi ou non pour l'utilisateur courant.
- `callback`, function, optionnel
  - Le nom de la fonction qui traitera les informations retounées par le LMS.

Si un callback est renseigné, il doit prendre en paramètre un objet (celui renvoyé par le LMS).

Le callback de `createCommunityPost` retourne:

```javascript

{ event: 'create_community_post',
 status: 'OK',
 status_message: '',
 community_group_url: '<url_du_groupe>',
 show_me_url: '<url_profil_utilisateur>',
 root_url: 'root_lms_url'
}

```

Le callback de `moduleWon` retourne:

```javascript

{ event: 'create_training_module_completion',
 status: 'OK',
 status_message: '',
 root_url: 'root_lms_url'
}

```

Une gestion des erreurs simple est mise en place.
Si le traitement se passe bien, la clé `status` de l'objet renvoyé est `OK` et la clé `message_status` est vide.
Dans le case contraire, la clé `status` de l'objet renvoyé est `ERROR` et la clé `message_status` permet de récupérer des informations plus précises sur la nature de l'erreur.

Exemple d'utilisation:

```javascript
var group_id = 17;
var message = 'Happy Message';
var image = 'my_base64_image';
var submit = submitButton;
var lms = new MTP_LMS();

var communityPostAdded = function(obj) {
  if (obj.status === 'ERROR') {
    // Traiter l'erreur
  } else {
    // Proposer de voir le groupe dans lequel le post a été envoyé
  }
};

var moduleCompletionSaved = function(obj) {
  if (obj.status === 'ERROR') {
    // Traiter l'erreur
  } else {
    // Remercier d'avoir jouer
  }
};

submit.on('click', function() {
  lms.createCommunityPost({
    content: message,
    community_group_id: group_id,
    callback: communityPostAdded
  });

  lms.moduleWon({
    success: true,
    callback: moduleCompletionSaved
  });
});

```
