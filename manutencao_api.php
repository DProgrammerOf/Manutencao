<?php
  include_once '../../seguranca.php';
  include_once '../../usuario/config.php';

  try {
      $conexaoBanco = new PDO('mysql:host='.$DB_SERVER.';dbname='.$DB_NAME.';charset=utf8', $DB_USER, $DB_PASS,
      array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
      $conexaoBanco->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

      // sleep(5); Simulação de LOADING
      $cnx = mysqli_connect($DB_SERVER, $DB_USER, $DB_PASS) or die("Não foi possivel conectar ao Mysql".mysqli_error());
      mysqli_select_db($cnx, $DB_NAME);
      mysqli_set_charset($cnx,"utf8");

      $tipoReq = $_SERVER['REQUEST_METHOD'];
      header('Content-type: application/json');
      $dados = file_get_contents('php://input');

      /* API - GET */
      if($tipoReq === 'GET'){
        $jsonDecode = json_decode($_GET['Manutencao'], true);

        if($jsonDecode['tipo'] == 'select'){      // LISTAGEM DE MANUTENÇÕES
          $manutencoes = array();
          $getDado = mysqli_query($cnx, "SELECT
            manutencao_bem.id, manutencao_bem.bem, manutencao_bem.descricao, manutencao_bem.ultima_manutencao, manutencao_bem.km_rodados, manutencao_bem.km_limite,
            bem.name, bem.marca
            FROM manutencao_bem
            INNER JOIN bem
            ON manutencao_bem.bem = bem.id
            WHERE manutencao_bem.cliente = '$clienteID' ORDER BY manutencao_bem.km_rodados DESC");
          while($coluna = mysqli_fetch_assoc($getDado) ) {
              array_push($manutencoes, array(
                'id'                        => $coluna['id'],
                'bemid'                     => $coluna['bem'],
                'descricao'                 => $coluna['descricao'],
                'ultima_manutencao'         => $coluna['ultima_manutencao'],
                'km_rodados'                => $coluna['km_rodados'],
                'km_limite'                 => $coluna['km_limite'],
                'placa'                     => $coluna['name'],
                'marca'                     => $coluna['marca']
              ));
          }
          $conexaoBanco = null;
          echo json_encode($manutencoes);
        }else if($jsonDecode['tipo'] == 'carros'){  // LISTAGEM DE CARROS
            $carros = array();
            $getDado = mysqli_query($cnx, "SELECT
              id,
              name,
              hodometro,
              marca,
              cor,
              tipo,
              ano
              FROM bem
              WHERE cliente = '$clienteID'");

            while($coluna = mysqli_fetch_assoc($getDado) ) {
                array_push($carros, array(
                  'id'                        => $coluna['id'],
                  'placa'                     => $coluna['name'],
                  'odometro'                  => $coluna['hodometro'],
                  'marca'                     => $coluna['marca'],
                  'cor'                       => $coluna['cor'],
                  'tipo'                      => $coluna['tipo'],
                  'ano'                       => $coluna['ano']
                ));
          }

        $conexaoBanco = null;
        echo json_encode($carros);
        }
    }
    /* MARCAR VISTO DA MANUTENÇÃO DO CLIENTE */
    else if($tipoReq === 'POST'){
        $jsonDecode = json_decode($dados, true);
        $jsonDecode = $jsonDecode['Manutencao'];

        if($jsonDecode['type'] == 'updManutencao'){
          $jsonDecode = $jsonDecode['dadosForm'];
          $placaBem = '';
          $categoria = '';

          $data = '';
          $odometro = '';
          $observacao_geral = '';
          $custo_geral = '';

          $item = '';
          $custo = '';
          $observacao = '';

          $check = '';

          $recorrencia = array();
          foreach($jsonDecode as $dado){
            switch ($dado['name']) {
              case 'placaBem':
                $placaBem = $dado['value'];
                break;
                case 'categoriaManutencao':
                  $categoria = $dado['value'];
                  break;
                  case 'infData':
                    $data = date_create($dado['value']);
                    break;
                    case 'infOdometro':
                      $odometro = $dado['value'];
                      break;
                      case 'infCustoGeral':
                        $custo_geral = $dado['value'];
                        break;
                        case 'infObsGeral':
                          $observacao_geral = $dado['value'];
                          break;
                          case 'infItem':
                            $item = $dado['value'];
                            break;
                            case 'infCusto':
                              $custo = $dado['value'];
                              break;
                              case 'infObs':
                                $observacao = $dado['value'];
                                break;
                                case 'categoriaCheck':
                                  $check = $dado['value'];
                                  break;
              default:
                if (strpos($dado['name'], 'recorrencia') !== false)
                    array_push($recorrencia, $dado['value']);
                break;
            }
          }

          foreach ($recorrencia as $key => $manutencao) {
            $getDado = mysqli_query($cnx, "SELECT
              manutencao_bem.id, manutencao_bem.bem, manutencao_bem.descricao, manutencao_bem.ultima_manutencao, manutencao_bem.km_rodados, manutencao_bem.km_limite
              FROM manutencao_bem
              WHERE manutencao_bem.cliente = '$clienteID' AND manutencao_bem.id = '$manutencao'");

            while( $coluna = mysqli_fetch_assoc($getDado) ){
              $insertDado = $conexaoBanco->prepare(
                'INSERT INTO manutencao_historico  (id_manutencao, placa, data, odometro, categoria, recorrencia,
                  item, custo, observacao, observacao_geral, custo_geral)
                 VALUES                  (:id_manutencao, :placa, :data, :odometro, :categoria, :recorrencia,
                  :item, :custo, :observacao, :observacao_geral, :custo_geral)');

              $insertDado->execute(array(
                ':id_manutencao'                => $manutencao,
                ':placa'                        => $placaBem,
                ':data'                         => date_format($data,"Y-m-d"),
                ':odometro'                     => $odometro,
                ':categoria'                    => $categoria,
                ':recorrencia'                  => $coluna['km_limite'],
                ':item'                         => $item,
                ':custo'                        => $custo,
                ':observacao'                   => $observacao,
                ':observacao_geral'             => $observacao_geral,
                ':custo_geral'                  => $custo_geral
              ));

              if($insertDado->rowCount()){
                if($check === 'Finalizar'){
                  if(mysqli_query($cnx, "DELETE FROM manutencao_bem WHERE id = '$manutencao'"))
                    echo "Manutenção ID: ".$coluna['id']." -> Histórico registrado com sucesso e manutenção excluída! ";
                  else
                    echo "Manutenção ID: ".$coluna['id']." -> Histórico registrado com sucesso e manutenção com problema na exclusão! ";
                }else if($check === 'Manter'){
                  if(mysqli_query($cnx, "UPDATE manutencao_bem SET km_rodados = '0' WHERE id = '$manutencao'"))
                    echo "Manutenção ID: ".$coluna['id']." -> Histórico registrado com sucesso e manutenção renovada! ";
                  else
                    echo "Manutenção ID: ".$coluna['id']." -> Histórico registrado com sucesso e manutenção com problema na renovação! ";
                }
              }else{
                echo "Manutenção ID: ".$coluna['id']." -> Erro em registrar histórico. ";
              }
            }
          }
        }else if($jsonDecode['type'] == 'addManutencao') {
            $bemId = $jsonDecode['bemId'];
            $imei = 0;
            $getDado = mysqli_query($cnx, "SELECT imei FROM bem WHERE id = '$bemId' AND cliente = '$clienteID' LIMIT 1");

            while( $coluna = mysqli_fetch_assoc($getDado) )
              $imei = $coluna['imei'];

            foreach ($jsonDecode['manutencoes'] as $key => $manutencao) {
            /*  echo "Registrar -> bemId: ".$bemId.", cliente: ".$clienteID.", imei: ".$imei.
              ", km_rodados: 0, km_limite: ".$manutencao['recorrencia'].", descricao: ".$manutencao['descricao']." | "; */

              $insertDado = $conexaoBanco->prepare(
                'INSERT INTO manutencao_bem  (cliente, imei, bem, km_rodados, km_limite, ultima_manutencao, descricao)
                 VALUES                      (:cliente, :imei, :bem, :km_rodados, :km_limite, :ultima_manutencao, :descricao)');

              $insertDado->execute(array(
                ':cliente'                    => $clienteID,
                ':imei'                       => $imei,
                ':bem'                        => $bemId,
                ':km_rodados'                 => 0,
                ':km_limite'                  => $manutencao['recorrencia'],
                ':ultima_manutencao'          => date("Y-m-d"),
                ':descricao'                  => $manutencao['descricao']
              ));

              if($insertDado->rowCount())
                echo "Manutenção: -> Manutenção registrada com sucesso! ";
              else
                echo "Manutenção: -> Manutenção teve problema em registrar! ";

            }
          //print_r($jsonDecode);
        }
    }else if($tipoReq === 'PUT'){
      $jsonDecode   = json_decode($dados, true);
      $jsonDecode   = $jsonDecode['pManutencao'];
      $idManutencao = $jsonDecode['id'];

      $updDado = mysqli_query($cnx, "UPDATE manutencao_bem
        SET km_rodados = '0'
        WHERE id = '$idManutencao'");

        echo json_encode(array("status" => true));
      return;
    }
  } catch (PDOException $e) {
      print "Error!: " . $e->getMessage() . "<br/>";
      die();
  }
?>
