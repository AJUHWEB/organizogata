let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
  'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  const fixo = document.getElementById("fixo").value;

  if (!data || !descricao || isNaN(valor)) return;

  const novo = {
    id: Date.now(),
    data,
    descricao,
    valor,
    tipo,
    fixo,
    pago: false
  };

  lancamentos.push(novo);

  if (fixo === "sim") {
    const dataObj = new Date(data);
    for (let i = 1; i < 12; i++) {
      const novaData = new Date(dataObj);
      novaData.setMonth(novaData.getMonth() + i);
      const repetido = { ...novo, id: Date.now() + i, data: novaData.toISOString().split('T')[0] };
      lancamentos.push(repetido);
    }
  }

  salvar();
  mostrarLancamentos();
  this.reset();
});

function salvar() {
  localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
}

function mostrarLancamentos() {
  const ul = document.getElementById("lista-lancamentos");
  ul.innerHTML = "";

  const inicio = new Date(anoAtual, mesAtual, 1);
  const fim = new Date(anoAtual, mesAtual + 1, 0);

  const filtrados = lancamentos
    .filter(l => {
      const lData = new Date(l.data);
      return lData >= inicio && lData <= fim;
    })
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  let totalReceitas = 0;
  let totalDespesas = 0;

  filtrados.forEach(l => {
    const li = document.createElement("li");
    li.className = "lancamento";

    const pagoCheck = document.createElement("input");
    pagoCheck.type = "checkbox";
    pagoCheck.checked = l.pago;
    pagoCheck.onchange = () => {
      l.pago = pagoCheck.checked;
      salvar();
      mostrarLancamentos();
    };

    const texto = document.createElement("span");
    texto.textContent = `${l.data} - ${l.descricao} - R$ ${l.valor.toFixed(2)} (${l.tipo})`;

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const btnDel = document.createElement("i");
    btnDel.textContent = "🗑️";
    btnDel.onclick = () => {
      lancamentos = lancamentos.filter(item => item.id !== l.id);
      salvar();
      mostrarLancamentos();
    };

    const btnEdit = document.createElement("i");
    btnEdit.textContent = "✏️";
    btnEdit.onclick = () => {
      const novoValor = prompt("Novo valor:", l.valor);
      const novaDesc = prompt("Nova descrição:", l.descricao);
      if (novoValor !== null && novaDesc !== null) {
        l.valor = parseFloat(novoValor);
        l.descricao = novaDesc;
        if (confirm("Deseja aplicar nos próximos lançamentos também?")) {
          lancamentos.forEach(outro => {
            if (
              outro.descricao === l.descricao &&
              new Date(outro.data) > new Date(l.data)
            ) {
              outro.valor = l.valor;
              outro.descricao = l.descricao;
            }
          });
        }
        salvar();
        mostrarLancamentos();
      }
    };

    acoes.appendChild(btnEdit);
    acoes.appendChild(btnDel);
    li.appendChild(pagoCheck);
    li.appendChild(texto);
    li.appendChild(acoes);
    ul.appendChild(li);

    if (l.pago) {
      if (l.tipo === "receita") totalReceitas += l.valor;
      else totalDespesas += l.valor;
    }
  });

  document.getElementById("total-receitas").textContent = totalReceitas.toFixed(2);
  document.getElementById("total-despesas").textContent = totalDespesas.toFixed(2);
  document.getElementById("saldo-final").textContent = (totalReceitas - totalDespesas).toFixed(2);
}

function mudarMes(direcao) {
  mesAtual += direcao;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  } else if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  atualizarCabecalho();
  mostrarLancamentos();
}

function atualizarCabecalho() {
  document.getElementById("mesAtualNome").textContent = `${meses[mesAtual]} de ${anoAtual}`;
  document.getElementById("mesAnterior").textContent = meses[(mesAtual - 1 + 12) % 12];
  document.getElementById("mesProximo").textContent = meses[(mesAtual + 1) % 12];
}

function goToPage(page) {
  alert(`Página ${page} ainda não implementada`);
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarCabecalho();
  mostrarLancamentos();
});
