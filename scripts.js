const Modal = {
    activeclassorNo() {
        document
        .querySelector('.modal-overlay')
        .classList
        .toggle('active');
    }

}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify (transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index,1)

        App.reload()
    },

    incomes (){
        let income = 0;
        // Somar as entradas
        // para cada transação
        Transaction.all.forEach((transaction) => {
            // Se ela for maior que zero
            if(transaction.amount > 0){
                // somar a uma variável e retornar a variável
                income += transaction.amount;
            } 
        })
        return income;

    },

    expenses (){
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0){
                expense += transaction.amount;
            } 
        })
        return expense;

    },

    total (){
        return Transaction.incomes() + Transaction.expenses()
    }

}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction (transaction,index) {
        const tr = document.createElement('tr');
        // O innerHTML serve para mostrar o que tem dentro deleted
        // ou receber um html
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        // Declarei a document.querySelector e dentro da transactionsContainer
        // eu joguei o tr que foi definido dentro da função innerHTMLTransaction(Transaction)
        DOM.transactionsContainer.appendChild(tr)

    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        
        const amount = Utils.formatCurrency(transaction.amount)

        const html = 
                    `<td class="description">${transaction.description}</td>
                        <td class="${CSSclass}">${amount}</td>
                        <td class="Date">${transaction.date}</td>
                        <td>
                        <img onclick="Transaction.remove(${index})" src="/assets/minus.svg" alt="Remover transação">
                    </td>`

        // O return envia os dados para fora da função
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = ''
    },

    switchTheme() {

        const invertTheme = (mediaText) => mediaText.indexOf('dark') > -1
                            ?['dark', 'light']
                            : ['light', 'dark']

        const cssRules = window.document.styleSheets[0].cssRules
        
        for (const rule of cssRules) {
            let media = rule.media
            
            if (media) {
                
                const [currentTheme,nextTheme] = invertTheme(media.mediaText)
               
                media.mediaText = media.mediaText.replace(
                    '(prefers-color-scheme: ' + currentTheme + ')',
                    '(prefers-color-scheme: ' + nextTheme + ')'
                  )
                console.log(media.mediaText)
            }
            
        }

        
    },

}

const Utils = {

    formatAmount(value){
        value = Number(value) * 100

        return value
    },

    formatDate(date){
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency (value) {
        const signal = Number(value) < 0 ? "-" : ""

        //String libera a funcionaloidade de replace
        //Ele substitui somente quando encontra o primeiro valor
        value = String(value).replace(/\D/g,"")

        //Converter em centena
        value = Number(value) / 100

        //Converter em moeda
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency:"BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const {description, amount, date} = Form.getValues()
        if(description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Favor, preencha todos os campos")
            }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description, //description: description,
            amount, //amount: amount
            date //date: date
        }

    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    animationform (){       
        const button = document
                        .getElementById("card-total")
        const validationform = document
                        .getElementById("modal-id")
                        .classList.contains("active")
        
        if (validationform) {
            button.classList.remove("div-bounce")
        } else {
            button.classList.toggle("div-bounce")
        }
        // const validate = 
        //     validationform 
        //     ?
        //     button.classList.remove("div-bounce")
        //     :
        //     button.classList.toggle("div-bounce");
    },

    submit(event) {
        event.preventDefault()

        try {
            //Verificar se as informações do formulário foram preenchidos
            Form.validateFields()
            //Formatar os dados para salvar
            const transaction = Form.formatValues()
            //Salvar
            Transaction.add(transaction)
            //apagar os dados do formulário
            Form.clearFields()
            //modal fechar
            Modal.activeclassorNo()
            //Movimentar a caixa do total
            Form.animationform()

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {

    init() {

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload(){
        DOM.clearTransaction()
        App.init()
    }
}




App.init() 
