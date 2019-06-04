<?php

include_once ('../../seguranca.php');
include_once ('../../config.php');
include_once ('../../usuario/config.php');

?>
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>SISTEMA DE MANUTENÇÃO</title>

    <meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' name='viewport' />
    <meta name="viewport" content="width=device-width" />

  	<script src="./js/jquery-3.2.1.min.js"></script>

    <script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css">
    <script src="https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.js"></script>
    <style>
      .tableManutencao > tbody > tr > td {
        vertical-align: top !important;
        line-height: 2;
        text-align: center !important;
      }

      .tableManutencao > thead > tr > th {
        text-align: center !important;
      }

      .tableManutencao > tbody > tr {
        background-color: #f9fafe !important;
      }

      #manutencaoRender > div > div.ui > div > table > tbody > tr.top.aligned > td.celButton {
        vertical-align: middle !important;
      }

      div.modalCheck {
        max-height: 100% !important;
        margin: auto;
      }

      .card .header {
        padding: 0 !important;
      }

      div.actions {
        position: absolute !important;
        width: 100% !important;
        bottom: 0 !important;
      }

      div.content.scrolling {
        max-height: calc(80vh) !important;
      }

      .mAtrasada {
        color: #db2828 !important;
      }
    </style>
  </head>
  <body>
     <div id="manutencaoRender"></div>

      <script src="./js/React/axios.min.js"></script>
      <script type="text/babel" src="./js/React/ManutencaoComponent.js"></script>
  </body>
</html>
