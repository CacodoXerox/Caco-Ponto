let totalMonthlyPay = 0;

document.getElementById('calculate-btn').addEventListener('click', function () {
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('start-time').value;
    const lunchStart = document.getElementById('lunch-start').value || '00:00'; // Se não houver valor, assume 00:00
    const lunchEnd = document.getElementById('lunch-end').value || '00:00'; // Se não houver valor, assume 00:00
    const endTime = document.getElementById('end-time').value;

    if (!date || !startTime || !endTime) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    let extraMinutes = 0;

    // Verifica se a entrada foi após as 8h
    if (startTime > '08:00') {
        extraMinutes -= calculateMinutesDifference(startTime, '08:00'); // desconta minutos se chegou depois das 8h
    } else if (startTime < '08:00') {
        extraMinutes += calculateMinutesDifference('08:00', startTime); // adiciona minutos se chegou antes das 8h
    }

    // Verifica se a saída foi antes das 18h
    if (endTime < '18:00') {
        extraMinutes -= calculateMinutesDifference('18:00', endTime); // desconta minutos se saiu antes das 18h
    } else if (endTime > '18:00') {
        extraMinutes += calculateMinutesDifference(endTime, '18:00'); // adiciona minutos se saiu depois das 18h
    }

    // Verifica a duração do almoço
    const lunchDuration = calculateMinutesDifference(lunchEnd, lunchStart);
    if (lunchDuration < 60) {
        extraMinutes += (60 - lunchDuration); // adiciona minutos se almoço foi menor que 1h
    } else if (lunchDuration > 60) {
        extraMinutes -= (lunchDuration - 60); // desconta minutos se almoço foi maior que 1h
    }

    // Calcula horas extras
    const extraHours = extraMinutes / 60; // converte para horas
    const extraPay = extraHours * 9.63; // valor a pagar por hora extra

    // Adiciona valor ao total mensal
    totalMonthlyPay += extraPay;

    // Adiciona resultado à tabela
    addToHistoryTable(date, extraHours.toFixed(2), extraPay.toFixed(2));

    // Atualiza exibição do resultado
    const resultText = extraHours > 0
        ? `Você trabalhou ${extraHours.toFixed(2)} horas extras. O valor a ser pago é R$ ${extraPay.toFixed(2)}.`
        : `Você teve ${Math.abs(extraHours).toFixed(2)} horas a menos. O desconto será de R$ ${Math.abs(extraPay).toFixed(2)}.`;

    document.getElementById('result-text').innerText = resultText;

    updateTotalPay();
});

// Função para calcular a diferença em minutos entre dois horários
function calculateMinutesDifference(time1, time2) {
    const date1 = new Date(`1970-01-01T${time1}:00`);
    const date2 = new Date(`1970-01-01T${time2}:00`);
    return Math.abs((date1 - date2) / (1000 * 60));
}

// Função para adicionar uma linha à tabela de histórico
function addToHistoryTable(date, extraHours, extraPay) {
    const historyTable = document.getElementById('history-table').querySelector('tbody');
    const newRow = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.innerText = date;
    newRow.appendChild(dateCell);

    const hoursCell = document.createElement('td');
    hoursCell.innerText = extraHours;
    newRow.appendChild(hoursCell);

    const payCell = document.createElement('td');
    payCell.innerText = `R$ ${extraPay}`;
    newRow.appendChild(payCell);

    historyTable.appendChild(newRow);
}

// Função para atualizar o valor total a pagar no final da tabela
function updateTotalPay() {
    document.getElementById('total-pay').innerText = `Total Mensal: R$ ${totalMonthlyPay.toFixed(2)}`;
}

// Função para gerar o PDF
document.getElementById('generate-pdf').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Relatório de Horas Extras", 10, 10);
    
    let tableContent = [];
    
    const rows = document.querySelectorAll("#history-table tbody tr");
    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const rowData = [];
        cells.forEach(cell => rowData.push(cell.innerText));
        tableContent.push(rowData);
    });

    // Adiciona o título das colunas da tabela
    doc.autoTable({
        head: [['Data', 'Horas Extras', 'Valor a Pagar (R$)']],
        body: tableContent,
        startY: 20,
    });

    // Adiciona o valor total no final
    doc.text(`Total Mensal: R$ ${totalMonthlyPay.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 10);
    
    // Salva o PDF
    doc.save('relatorio_horas_extras.pdf');
});
