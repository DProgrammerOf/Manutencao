class Menu extends React.Component {
  render(){
    return (
      <div className="ui pointing secondary menu">
        <a className="item center active" data-tab="first">Lembretes de manutenção</a>
        <a className=" item" data-tab="second">Histórico de manutenções</a>
      </div>
    );
  }
}

class PassosAdd extends React.Component {
    render(){
      const {etapa, finish} = this.props;
      const etapa1 = (etapa > 1) ? 'completed' : 'active';
      const etapa2 = (etapa > 2) ? 'completed' : (etapa === 2) ? 'active' : 'disabled';
      const etapa3 = (etapa === 3 && finish) ? 'completed' : (etapa === 3) ? 'active' : 'disabled';
      return(
        <div className="ui small steps" style={{margin: '0 auto'}}>
          <div className={`${etapa1} step`} onClick={() => {this.props.setEtapa(1)}}>
            <i className="car icon"></i>
            <div className="content">
              <div className="title">Veículo</div>
              <div className="description">Escolha o veículo a ser monitorado</div>
            </div>
          </div>
          <div className={`${etapa2} step`} onClick={() => {this.props.setEtapa(2)}}>
            <i className="sync alternate icon"></i>
            <div className="content">
              <div className="title">Recorrências</div>
              <div className="description">Configure as novas manutenções</div>
            </div>
          </div>
          <div className={`${etapa3} step`} onClick={() => {this.props.setEtapa(3)}}>
            <i className="tasks icon"></i>
            <div className="content">
              <div className="title">Finalizar Manutenção</div>
            </div>
          </div>
        </div>
      );
    }
}

class Opcoes extends React.Component {
  state = { carrosCliente: null,
            etapa: 1, finish: false,
            carroIdSelecionado: null,  carroOdometroSelecionado: null, carroTipoSelecionado: null,        // CARRO PRIMEIRA ETAPA
            descricaoInput: '', recorrenciaInput: '', listaManutencoes: []                                // RECORRENCIA SEGUNDA ETAPA
         }

  constructor(props){
    super(props);

    this.handleSelectCarro = this.handleSelectCarro.bind(this);
    this.handleAddManutencao = this.handleAddManutencao.bind(this);
    this.handleSetEtapa = this.handleSetEtapa.bind(this);
    this.handleFinish = this.handleFinish.bind(this);
  }

  componentDidMount(){
    const Manutencao = {
      tipo: 'carros'
    }

    axios.get('http://localhost/manutencao_api.php',
    {params: {Manutencao} })
    .then( res => {

      this.setState({carrosCliente: res.data})
      $('.addManutencao.modal')
      .modal('attach events', '.btnAddManutencao.button', 'show');
    });
  }

  handleSelectCarro(id, odometro, tipo){ // PRIMEIRA ETAPA
    this.setState({carroIdSelecionado: id, carroOdometroSelecionado: odometro, carroTipoSelecionado: tipo,
      etapa: 2, descricaoInput: '', recorrenciaInput: '', listaManutencoes: []});
  }

  handleAddManutencao(descricao, recorrencia){
    const novaManutencoes = this.state.listaManutencoes;
    this.setState({listaManutencoes: novaManutencoes.concat([{descricao, recorrencia}]), descricaoInput: '', recorrenciaInput: ''})
  }

  handleFinish(){
    const Manutencao =  {
      type: 'addManutencao',
      bemId: this.state.carroIdSelecionado,
      manutencoes: this.state.listaManutencoes
    }

    //console.log(Manutencoes);
  //  console.log(DadosHistorico);
    this.setState({etapa: 3});
    axios.post(`http://localhost/manutencao_api.php`, { Manutencao })
      .then(res => {
        //console.log(User);
        //console.log(res);
        this.setState({finish: true});
        console.log(res.data);
        this.props.attManutencao();
      })

  }

  handleSetEtapa(etapa){
    if(etapa === 'reset'){
      this.setState({
        etapa: 1, finish: false,
        carroIdSelecionado: null,  carroOdometroSelecionado: null, carroTipoSelecionado: null,
        descricaoInput: '', recorrenciaInput: '', listaManutencoes: []
      })
      return;
    }

    if(etapa !== this.state.etapa)
      if(etapa === 3)
        this.handleFinish()
      else
        this.setState({etapa: etapa})
  }

  render(){
    const {descricaoInput, recorrenciaInput, listaManutencoes, carroOdometroSelecionado, carroTipoSelecionado, finish} = this.state;
    const isOkAdd  = (descricaoInput !== '' && recorrenciaInput !== '') ? 'focus' : 'disabled';
    const isOkNext = (Object.keys(listaManutencoes).length > 0) ? 'focus' : 'disabled';
    const isScroll = (true) ? 'scrolling' : null;

    const CarrosCliente = (this.state.carrosCliente && this.state.etapa === 1) ? this.state.carrosCliente.map((carro) => {
      const icon = (carro.tipo === 'CAMINHAO') ? 'truck' : (carro.tipo === 'MOTO') ? 'motorcycle' : 'car';
      return (<div key={carro.id} className="ui tiny card">
        <div className="content">
          <i className={`right floated ${icon} icon`}></i>
          <div className="header">{carro.placa}</div>
          <div className="description">
            <p><strong>Odometro:</strong> {carro.odometro}</p>
            <p><strong>Modelo:</strong> {carro.marca}</p>
            <p><strong>Ano:</strong> {carro.ano}</p>
            <p><strong>Cor:</strong> {carro.cor}</p>
          </div>
        </div>
        <div className="extra content">
          <div className="center aligned">
            <button className="ui primary fluid button" onClick={(e) => {this.handleSelectCarro(carro.id, carro.odometro, carro.tipo)}}>Selecionar</button>
          </div>
        </div>
      </div>)}) : null

    const FormCliente = (this.state.etapa === 2) ? <div className="three fields">
        <div className="eight wide field">
          <label>Descrição</label>
          <input type="text" name="descricaoInput" value={descricaoInput}
          onChange={(e) => {this.setState({[e.target.name]:e.target.value})}}
          placeholder="Descreva sua manutenção" />
        </div>
        <div className="eight wide field">
          <label>Recorrência</label>
          <input type="text" name="recorrenciaInput" value={recorrenciaInput}
          onChange={(e) => {this.setState({[e.target.name]:e.target.value})}}
          placeholder="Informe a kilometragem para a próxima manutenção" />
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <button className={`ui primary fluid button ${isOkAdd}`} onClick={(e)=>{this.handleAddManutencao(descricaoInput,recorrenciaInput)}}>Adicionar</button>
        </div>
      </div> : null

    return (
      <div style={{position: 'absolute', right: 10}}>
      <div className="ui addManutencao modal">
        <div className="header" style={{textAlign: 'center'}}>
          <PassosAdd finish={finish} etapa={this.state.etapa} setEtapa={this.handleSetEtapa}/>
        </div>
        <div className={`content ${isScroll}`}>

        { (this.state.etapa === 1) ?
          <div className="ui">
            <h3>Selecione o veículo</h3>
            <div className="ui three cards">
              {CarrosCliente}
            </div>
          </div>
          :
          (this.state.etapa === 2) ?
          <div className="ui">
            <h4>Manutenção</h4>
            <div className="ui form">
              {FormCliente}
            </div>

            <h4>Manutenções adicionadas</h4>
            <table className="ui blue table">
              <thead>
                <tr>
                  <th>Ôdometro atual</th>
                  <th>Kilometragem limite</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {listaManutencoes.map((manutencao, index) =>
                <tr key={index}>
                  <td>{carroOdometroSelecionado}</td>
                  <td>{manutencao.recorrencia} ({(+carroOdometroSelecionado)+(+manutencao.recorrencia)})</td>
                  <td>{manutencao.descricao}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          : //ETAPA 3
          (this.state.etapa === 3 && finish) ?
            <div className="ui container">
              <div className="ui big very relaxed divided list">
                { listaManutencoes.map( (manutencao, index) => {
                  const icon = (carroTipoSelecionado === 'CAMINHAO') ? 'truck' : (carroTipoSelecionado === 'MOTO') ? 'motorcycle' : 'car';
                  return (
                  <div key={index} className="item">
                    <i className={`large ${icon} middle aligned icon`}></i>
                    <div className="content">
                      <a className="header green">Manutenção #{(index+1)}</a>
                      <div className="description"><br />
                      <strong>Ôdometro atual:</strong> {carroOdometroSelecionado} Km <br /><br />
                      <strong>Ôdometro manutenção:</strong> {(+carroOdometroSelecionado)+(+manutencao.recorrencia)} Km <i>(Daqui há {manutencao.recorrencia} km)</i> <br /><br />
                      <strong>Descrição:</strong> {manutencao.descricao} <br /><br />
                      <strong>Status:</strong> <i className="small check green icon"></i> Criada! <br />
                      </div>
                    </div>
                  </div>)})
                }
              </div>
            </div>
          :
          (this.state.etapa === 3 && !finish) ?
              <div className="ui active inverted dimmer">
                <div className="ui large text loader">Estamos registrando suas manutenções, um momento...</div>
              </div>
          : null
        }

        </div>

        { (this.state.etapa === 2) ?
          <div className="actions">
            <div className={`ui green button ${isOkNext}`} onClick={()=>{this.handleSetEtapa(3)}}>Continuar</div>
          </div>
          :
          (finish) ?
          <div className="actions">
            <div className={`ui blue button`} onClick={()=>{this.handleSetEtapa('reset')}}>Finalizar</div>
          </div>
          :
          null
        }

      </div>
        <div className="ui primary btnAddManutencao medium button">
          <i className="add icon"></i>
          Registrar manutenção
        </div>
        <div className="ui floating labeled icon dropdown button hidden">
        <i className="cogs icon"></i>
        <span className="text">Opções</span>
        <div className="menu">
          <div className="item">
            <i className="add icon"></i>
            Add
          </div>
        </div>
        </div>
      </div>
    );
  }
}

class Modal extends React.Component {
  state = { infRecorrencia: '', infGeral: '', infData: '', infOdometro: '', infCustoGeral: '', infObsGeral: '',
            infItem: '', infCusto: '', infObs: '',
            checkPreventiva: false, checkCorretiva: false, checkFinalizar: false, checkManter: false, finish: false}
  constructor(props){
    super(props);

    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  componentDidMount() {
    $('.ui.modalCheck.modal').modal('show');
  }

  componentWillReceiveProps() {
    if(this.state.finish)
      this.setState({
                infRecorrencia: '', infGeral: '', infData: '', infOdometro: '', infCustoGeral: '', infObsGeral: '',
                infItem: '', infCusto: '', infObs: '',
                checkPreventiva: false, checkCorretiva: false, checkFinalizar: false, checkManter: false, finish: false, loading: false})
    else
      $('.ui.modalCheck.modal').modal('show');
  }

  handleChangeInput(e){
    this.setState({[e.target.name]: e.target.value});
  }

  handleChangeCheck(e, categoria){
  //  console.log(e.target);
  //  console.log("Categoria: "+categoria);
    if(categoria === 'Preventiva')
      this.setState({checkPreventiva: !this.state.checkPreventiva, checkCorretiva: false})
    else if(categoria === 'Corretiva')
      this.setState({checkCorretiva: !this.state.checkCorretiva, checkPreventiva: false})
    else if(categoria === 'Finalizar')
      this.setState({checkFinalizar: !this.state.checkFinalizar, checkManter: false})
    else if(categoria === 'Manter')
      this.setState({checkManter: !this.state.checkManter, checkFinalizar: false})

  }

  handleSubmit(e){
    $("#checkManutencao").submit(
      function(e){
        //e.preventDefault()
      }
    );
  }

  handleFormSubmit(e){
    e.preventDefault();
    const dadosForm = $('form[name="checkManutencao"]').serializeArray();
    const Manutencao = {
      type: 'updManutencao',
      dadosForm: dadosForm
    }
  //  console.log(DadosHistorico);
        this.setState({loading: true});
    axios.post(`http://localhost/manutencao_api.php`, { Manutencao })
      .then(res => {
        //console.log(User);
        //console.log(res);
        console.log(res.data);
        this.props.attManutencao();
        this.setState({finish:true, loading:false});
        $('.ui.modalCheck.modal').modal('hide');
      })
  }

  render(){
    //console.log(this.props.checkCarro);
    const {placaBem} = this.props.checkCarro;
    const {infRecorrencia, infGeral, infData, infOdometro, infCustoGeral, infObsGeral,
          infItem, infCusto, infObs, checkPreventiva, checkCorretiva, checkFinalizar, checkManter, loading} = this.state;

    const Recorrencias = this.props.checkCarro.map((manutencao) =>
    <div key={manutencao.id} className="four wide column" data-tooltip={`${manutencao.descricao}`} data-position="top center">
      <div className="ui" style={{paddingLeft: 31}}>
        <input type="checkbox" name={`recorrencia-${manutencao.id}`} value={manutencao.id}
        style={{width:17, height:17, backgroundColor:'white', top:-3, position:'relative'}} />
        <label style={{paddingLeft: 5}}>{manutencao.km_limite} KM</label>
      </div>
    </div>);

    return (
        <div className={`ui modalCheck modal`}>
          {(loading) ?
            <div className="ui active inverted dimmer">
                <div className="ui large text loader">Atualizando manutenção, aguarde um momento...</div>
            </div> : null
          }
          <i className="close icon"></i>
          <div className="header">
            Marcar como feito
          </div>
          <div className="content">
            <form ref="form" name="checkManutencao" id="checkManutencao">
              <div className="ui form">

              <h4>Veículo</h4>
                <div className="two fields">
                  <div className="field">
                    <div id="carroDrop" className="ui disabled selection dropdown">
                        <input type="hidden" name="placaBem" value={this.props.checkCarro[0].placa} />
                        <i className="dropdown icon"></i>
                        <div className="default text">{this.props.checkCarro[0].placa}</div>
                        <div className="menu">
                        </div>
                    </div>
                  </div>
                </div>

              <h4>Recorrência</h4>
                  <div className="ui grid">
                    {Recorrencias}
                  </div>

              <h4>Informações Gerais</h4>
                <div className="ui grid">
                  <div className="four wide column" >
                    <div className="ui checkbox" onClick={(e) => {this.handleChangeCheck(e, 'Preventiva')}}>
                      <input name="categoriaManutencao" type="checkbox" value="Preventiva" checked={checkPreventiva}/>
                      <label>Preventiva</label>
                    </div>
                  </div>
                  <div className="four wide column">
                    <div className="ui checkbox" onClick={(e) => {this.handleChangeCheck(e, 'Corretiva')}}>
                      <input name="categoriaManutencao" type="checkbox" value="Corretiva" checked={checkCorretiva}/>
                      <label>Corretiva</label>
                    </div>
                  </div>
                </div>

                <div className="four fields" style={{marginTop:30}}>
                  <div className="field">
                    <label>Data de manutenção</label>
                    <div className="ui left icon input">
                      <input type="text" placeholder="dd/mm/aaaa" value={infData} name="infData" onChange={this.handleChangeInput} />
                      <i className="calendar alternate outline icon"></i>
                    </div>
                  </div>
                  <div className="field">
                    <label>Ôdometro na data</label>
                    <input type="text" placeholder="km" value={infOdometro} name="infOdometro" onChange={this.handleChangeInput} />
                  </div>
                  <div className="field">
                    <label>Custo total</label>
                    <input type="text" placeholder="R$" value={infCustoGeral} name="infCustoGeral" onChange={this.handleChangeInput} />
                  </div>
                  <div className="field">
                    <label>Observações Gerais</label>
                    <input type="text" placeholder="Observações Gerais" value={infObsGeral} name="infObsGeral" onChange={this.handleChangeInput} />
                  </div>
                </div>



                <h4>O que foi feito</h4>
                <div className="four fields">
                  <div className="eight wide field">
                    <label>Item</label>
                    <input type="text" placeholder="Descreva a manutenção" value={infItem} name="infItem" onChange={this.handleChangeInput} />
                  </div>
                  <div className="field">
                    <label>Custo do Item</label>
                    <input type="text" placeholder="R$" value={infCusto} name="infCusto" onChange={this.handleChangeInput} />
                  </div>
                  <div className="field">
                    <label>Observações</label>
                    <input type="text" placeholder="Observações" value={infObs} name="infObs" onChange={this.handleChangeInput} />
                  </div>
                </div>

                <h4>Manutenção</h4>
                              <div className="ui grid">
                                <div className="four wide column">
                                  <div className="ui checkbox" onClick={(e) => {this.handleChangeCheck(e, 'Finalizar')}}>
                                    <input name="categoriaCheck" type="checkbox" value="Finalizar" checked={checkFinalizar}/>
                                    <label>Remover recorrência</label>
                                  </div>
                                </div>
                                <div className="four wide column">
                                  <div className="ui checkbox" onClick={(e) => {this.handleChangeCheck(e, 'Manter')}}>
                                    <input name="categoriaCheck" type="checkbox" value="Manter" checked={checkManter}/>
                                    <label>Manter recorrência</label>
                                  </div>
                                </div>
                              </div>
              </div>



            </form>
          </div>
          <div className="actions">
            <div className="ui cancel secondary basic button">Cancelar</div>
            <button className="ui green button" onClick={this.handleFormSubmit}>
              Cadastrar
            </button>
          </div>
        </div>
    );
  }
}

class Carro extends React.Component {
  constructor(props){
    super(props);
    this.handleCheckButton = this.handleCheckButton.bind(this);
  }

  handleCheckButton() {
  //  console.log("Atualizar Manutenção: "+this.props.idManuntencao);
    this.props.showModalCarro(this.props.manutencoes);
    return;


    const pManutencao = {
      id: this.props.idManuntencao
    }
    axios.put('http://localhost/manutencao_api.php',
    {pManutencao})
    .then( res => {
      if(res.data.status)
        this.props.attManutencao();
    });
  }


  render() {
    const {marcaBem, placaBem, ultManutencao, limitManutencao, rodadoManutencao} = this.props
    const ManutencoesDoCarro = this.props.manutencoes.map((manutencao, index) => {
    const QtdManutencoes = Object.keys(this.props.manutencoes).length;
    const isAtrasada = ( (manutencao.km_limite-manutencao.km_rodados) < 0 ) ? 'mAtrasada' : null;
    const colorManutencaoHook = ( (manutencao.km_limite-manutencao.km_rodados) < 0 ) ? 'red' : this.props.colorManutencao;
    return (index == 0) ?
    (
      <tr className="top aligned" key={manutencao.id} >
        <td style={{borderLeft: '8px solid '+colorManutencaoHook  }}>
          <strong>{manutencao.placa}</strong> <br />
          {manutencao.marca}
        </td>

        <td>
          {manutencao.ultima_manutencao}
        </td>

        <td>
          A cada {manutencao.km_limite} Km
        </td>

        <td data-tooltip={`${manutencao.descricao}`} data-position="top center" className={`${isAtrasada}`}>
          {( (manutencao.km_limite-manutencao.km_rodados) < 0 ) ? <i className="exclamation triangle red icon"></i> : null}
          {( (manutencao.km_limite-manutencao.km_rodados) < 0 ) ? 'Atrasada há ' : 'Daqui '}
          {( (manutencao.km_limite-manutencao.km_rodados) < 0 ) ?
            (manutencao.km_limite-manutencao.km_rodados)*-1
            :
            (manutencao.km_limite-manutencao.km_rodados)
          } Km <br />
          <div id="progress-{placaBem}" className={`ui tiny ${colorManutencaoHook} progress`}
          data-percent={((manutencao.km_rodados/manutencao.km_limite) * 100).toFixed(3)} style={{height:'100%', margin: '10px auto', width: '90%'}}>
            <div className="bar" style={{width: `${((manutencao.km_rodados/manutencao.km_limite) * 100).toFixed(3)}%`}} ></div>
          </div>
        </td>

        <td className="celButton" rowSpan={QtdManutencoes} style={{borderLeft: '1px solid rgba(0,0,0,.1)'}}>
          <button className="positive ui markCheck button" onClick={this.handleCheckButton}>
          <i className="check circle outline icon"></i>
            Marcar como feito
          </button>

        </td>
      </tr>)
    :
    (
      <tr key={manutencao.id}>
        <td style={{borderLeft: '8px solid '+this.props.colorManutencao}}></td>
        <td></td>
        <td>
          A cada {manutencao.km_limite} Km
        </td>
        <td data-tooltip={`${manutencao.descricao}`} data-position="top center">
          {( (manutencao.km_limite-manutencao.km_rodados) < 0 ) ? 'Atrasada há ' : 'Daqui '}
          {( (manutencao.km_limite-manutencao.km_rodados) < 0 ) ?
            (manutencao.km_limite-manutencao.km_rodados)*-1
            :
            (manutencao.km_limite-manutencao.km_rodados)
          } Km <br />
          <div id="progress-{placaBem}" className={`ui tiny ${this.props.colorManutencao} progress`}
          data-percent={((manutencao.km_rodados/manutencao.km_limite) * 100).toFixed(3)} style={{height:'100%', margin: '10px auto', width: '90%'}}>
            <div className="bar" style={{width: `${((manutencao.km_rodados/manutencao.km_limite) * 100).toFixed(3)}%`}} ></div>
          </div>
        </td>
      </tr>
    )
    });
    return (
        <tbody style={{borderBottom: '20 solid #f4f3ef'}}>
          {ManutencoesDoCarro}
        </tbody>
    );
  }
}

const ManutencaoTable = ({children}) => {
    return (
      <div className="ui vertical segment" style={{borderBottom: 'none', padding: 0}}>

        <table className="ui very basic table tableManutencao" style={{borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th>Veículo</th>
              <th>Última manutenção</th>
              <th>Recorrência</th>
              <th>Próxima manutenção</th>
              <th></th>
            </tr>
          </thead>
        {children}
        </table>

      </div>
    )
}

class Manutencao extends React.Component {

  constructor(props){
    super(props);

    this.state = {manutencaoProxima: [], manutencaoFutura: [], checkCarro: null, loading: false};
    /*      {
            bemid:"1031",
            descricao:"Reparo das Rodas",
            id:"3",
            km_limite:"1000",
            km_rodados:"788",
            marca:"PEUGEOT",
            placa:"MJZ-7920",
            ultima_manutencao:"29/05/2019"
          } */
    this.refreshManutencao = this.refreshManutencao.bind(this);
    this.showModalCarro = this.showModalCarro.bind(this);

  }

  showModalCarro(objManutencao){
    this.setState({checkCarro: objManutencao});
  }

  refreshManutencao(){
    const Manutencao = {
      tipo: 'select',
      id: 1
    }
    axios.get('http://localhost/manutencao_api.php',
    {params: {Manutencao} })
    .then( res => {
        let todasManutencao     = [];
        let manutencaoOtimizada = [];
        let manutencoesFuturas  = [];
        let manutencoesProximas = [];

        if(res.data.length == 0){
          this.setState({loading: false, manutencaoProxima: [], manutencaoFutura: []});
          return;
        }else if(res.data.length == 1){
          res.data.map((manutencao) => {
            let manutencaoSimplificadaFutura = [];
            let manutencaoSimplificadaProxima = [];

            let perc = ((manutencao.km_rodados/manutencao.km_limite) * 100).toFixed(3);
            (perc > 50) ?  manutencaoSimplificadaProxima.push(manutencao) : manutencaoSimplificadaFutura.push(manutencao);

            var qtdMFuturas = Object.keys(manutencaoSimplificadaFutura).length;
            var qtdMProxima = Object.keys(manutencaoSimplificadaProxima).length;

            if(qtdMFuturas)
              manutencoesFuturas.push(manutencaoSimplificadaFutura);

            if(qtdMProxima)
              manutencoesProximas.push(manutencaoSimplificadaProxima);

            //console.log(manutencao);
          });
          this.setState({manutencaoFutura: manutencoesFuturas, manutencaoProxima: manutencoesProximas, loading: false})
          return;
        }

      //  console.log(res.data);

        res.data.map((manutencao) => {
          todasManutencao.push(manutencao);
        });


        todasManutencao.reduce((result, item, index) => {
          let bemId = item.bemid;

          // VERIFICANDO SE JÁ EXISTE A MANUTENÇÃO OTIMIZADA NO OBJETO
          let isExist;
          manutencaoOtimizada.map((itemOtimizado) => (itemOtimizado === bemId) ? isExist=true : null)
          console.log(isExist);
          if(isExist) return;

          console.log(manutencaoOtimizada);
          let manutencaoSimplificadaFutura = [];
          let manutencaoSimplificadaProxima = [];

          let perc = ((item.km_rodados/item.km_limite) * 100).toFixed(3);
          (perc > 50) ?  manutencaoSimplificadaProxima.push(item) : manutencaoSimplificadaFutura.push(item);

          console.log("O Carro com ID: "+bemId);

          todasManutencao.map((subItem) => {
            let percSubItem = ((subItem.km_rodados/subItem.km_limite) * 100).toFixed(3);

            if(percSubItem > 50)
              (subItem.bemid === item.bemid && subItem.id !== item.id) ? manutencaoSimplificadaProxima.push(subItem) : null
            else
              (subItem.bemid === item.bemid && subItem.id !== item.id) ? manutencaoSimplificadaFutura.push(subItem) : null
          });
          //console.log("manutencaoSimplificada "+index+" : ");
          //console.log(manutencaoSimplificada);
          //console.log(manutencaoSimplificadaFutura);
          //console.log(manutencaoSimplificadaProxima);
          var qtdMFuturas = Object.keys(manutencaoSimplificadaFutura).length;
          var qtdMProxima = Object.keys(manutencaoSimplificadaProxima).length;
        //  console.log(qtdMFuturas);
          if(qtdMFuturas > 0)
            console.log("Possui "+qtdMFuturas+" manutenções futuras!");
          else
            console.log("Não possui nenhuma manutenção futura.");

          if(qtdMProxima > 0)
            console.log("Possui "+qtdMProxima+" manutenções próximas!");
          else
            console.log("Não possui nenhuma manutenção próxima.");

          if(qtdMFuturas)
            manutencoesFuturas.push(manutencaoSimplificadaFutura);

          if(qtdMProxima)
            manutencoesProximas.push(manutencaoSimplificadaProxima);

          manutencaoOtimizada.push(bemId);
        }, null)



        this.setState({manutencaoFutura: manutencoesFuturas, manutencaoProxima: manutencoesProximas, loading: false})
      });

  }

  componentDidMount(){
    const Manutencao = {
      tipo: 'select',
      id: 1
    }
    this.setState({loading: true});
    axios.get('http://localhost/manutencao_api.php',
    {params: {Manutencao} })
    .then( res => {
        let todasManutencao     = [];
        let manutencaoOtimizada = [];
        let manutencoesFuturas  = [];
        let manutencoesProximas = [];

        if(res.data.length == 0){
          this.setState({loading: false});
          return;
        }else if(res.data.length == 1){
          res.data.map((manutencao) => {
            let manutencaoSimplificadaFutura = [];
            let manutencaoSimplificadaProxima = [];

            let perc = ((manutencao.km_rodados/manutencao.km_limite) * 100).toFixed(3);
            (perc > 50) ?  manutencaoSimplificadaProxima.push(manutencao) : manutencaoSimplificadaFutura.push(manutencao);

            var qtdMFuturas = Object.keys(manutencaoSimplificadaFutura).length;
            var qtdMProxima = Object.keys(manutencaoSimplificadaProxima).length;

            console.log(qtdMProxima);
            if(qtdMFuturas)
              manutencoesFuturas.push(manutencaoSimplificadaFutura);

            if(qtdMProxima)
              manutencoesProximas.push(manutencaoSimplificadaProxima);
            //console.log(manutencao);
          });
          this.setState({manutencaoFutura: manutencoesFuturas, manutencaoProxima: manutencoesProximas, loading: false})
          return;
        }

        console.log(res.data);

        res.data.map((manutencao) => {
        //  console.log(manutencao.bemid);
          todasManutencao.push(manutencao);
        });


        todasManutencao.reduce((result, item, index) => {
          let bemId = item.bemid;
          //if(bemId == '1019')
          //  console.log(bemId);
          // VERIFICANDO SE JÁ EXISTE A MANUTENÇÃO OTIMIZADA NO OBJETO
          let isExist;
          //console.log(manutencaoOtimizada);
          manutencaoOtimizada.map((itemOtimizado) => (itemOtimizado === bemId) ? isExist=true : null)
          //console.log(isExist);
          if(isExist) return;

          //console.log(manutencaoOtimizada);
          let manutencaoSimplificadaFutura = [];
          let manutencaoSimplificadaProxima = [];

          let perc = ((item.km_rodados/item.km_limite) * 100).toFixed(3);
          (perc > 50) ?  manutencaoSimplificadaProxima.push(item) : manutencaoSimplificadaFutura.push(item);

          todasManutencao.map((subItem) => {
            let percSubItem = ((subItem.km_rodados/subItem.km_limite) * 100).toFixed(3);

            if(percSubItem > 50)
              (subItem.bemid === item.bemid && subItem.id !== item.id) ? manutencaoSimplificadaProxima.push(subItem) : null
            else
              (subItem.bemid === item.bemid && subItem.id !== item.id) ? manutencaoSimplificadaFutura.push(subItem) : null
          });
          //console.log("manutencaoSimplificada "+index+" : ");
          //console.log(manutencaoSimplificada);
          //console.log(manutencaoSimplificadaFutura);
          //console.log(manutencaoSimplificadaProxima);
          var qtdMFuturas = Object.keys(manutencaoSimplificadaFutura).length;
          var qtdMProxima = Object.keys(manutencaoSimplificadaProxima).length;
        //  console.log(qtdMFuturas);
        //  if(qtdMFuturas > 0)
        //    console.log("Possui "+qtdMFuturas+" manutenções futuras!");
        //  else
        //    console.log("Não possui nenhuma manutenção futura.");

        //  if(qtdMProxima > 0)
        //    console.log("Possui "+qtdMProxima+" manutenções próximas!");
        //  else
      //      console.log("Não possui nenhuma manutenção próxima.");

          if(qtdMFuturas)
            manutencoesFuturas.push(manutencaoSimplificadaFutura);

          if(qtdMProxima)
            manutencoesProximas.push(manutencaoSimplificadaProxima);

          manutencaoOtimizada.push(bemId);
        }, null)



        this.setState({manutencaoFutura: manutencoesFuturas, manutencaoProxima: manutencoesProximas, loading: false})
      });
  }

  render() {
    const ManutencoesProximas = <ManutencaoTable>
      {  this.state.manutencaoProxima.map((manutencoes, key) =>
        <Carro  key={key}
                colorManutencao="orange"
                attManutencao={this.refreshManutencao}
                showModalCarro={this.showModalCarro}
                manutencoes={manutencoes} />
      ) }
      </ ManutencaoTable>;

    const ManutencoesFuturas = <ManutencaoTable>
        {  this.state.manutencaoFutura.map((manutencoes, key) =>
          <Carro  key={key}
                  colorManutencao="blue"
                  attManutencao={this.refreshManutencao}
                  showModalCarro={this.showModalCarro}
                  manutencoes={manutencoes}  />
        ) }

      </ ManutencaoTable>;

    const manutencaoFutura = Object.keys(this.state.manutencaoFutura).length;
    const manutencaoProxima = Object.keys(this.state.manutencaoProxima).length;

    const ContentProximas = (manutencaoProxima > 0) ? <div className="ui">
      <h3 style={{textAlign:'left', paddingLeft: 5, marginTop: 'calc(2rem - 0.142857em)'}} className="ui dividing header">
        Manutenções próximas
      </h3>
        { ManutencoesProximas }
      </div> : null

    const ContentFuturas = (manutencaoFutura > 0) ? <div className="ui">
      <h3 style={{textAlign:'left', paddingLeft: 5, marginTop: 'calc(2rem - 0.142857em)'}} className="ui dividing header">
        Manutenções futuras
      </h3>
        { ManutencoesFuturas }
      </div> : null

    return (
      <div style={{paddingTop: 15}}>
      {(this.state.loading) ?
        <div className="ui active dimmer">
          <div className="ui massive text loader">Carregando manutenções...</div>
        </div>
        :
        null
      }
        <Opcoes attManutencao={this.refreshManutencao} />

        {ContentProximas}

        {ContentFuturas}

       { (this.state.checkCarro !== null) ? <Modal attManutencao={this.refreshManutencao} checkCarro={this.state.checkCarro} /> : null }

      </div>
    );
  }
}

ReactDOM.render(
  <Manutencao />,
  document.getElementById('manutencaoRender')
);

  $('.dropdown')
  .dropdown();

  $('select#carroDrop')
  .dropdown();

  $('.ui.checkbox')
  .checkbox();
