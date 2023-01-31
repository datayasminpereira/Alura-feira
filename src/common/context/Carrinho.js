import { createContext, useContext, useEffect, useState } from "react"
import { usePagamentoContext } from './Pagamento'
import { UsuarioContext } from './Usuario'

export const CarrinhoContext = createContext()
CarrinhoContext.displayName = "Carrinho"

export const CarrinhoProvider = ({ children }) => {

    const [carrinho, setCarrinho] = useState([])
    const [quantidadeProdutos, setQuantidadeProdutos] = useState(0)
    const [valorTotalCarrinho, setValorTotalCarrinho] = useState(0)

    return (
        <CarrinhoContext.Provider 
            value={{ 
                carrinho, 
                setCarrinho, 
                quantidadeProdutos,
                setQuantidadeProdutos,
                valorTotalCarrinho,
                setValorTotalCarrinho 
        }}>
            {children}
        </CarrinhoContext.Provider>
    )
}

export const useCarrinhoContext = () => {

    const { 
        carrinho, 
        setCarrinho,
        quantidadeProdutos, 
        setQuantidadeProdutos,
        valorTotalCarrinho,
        setValorTotalCarrinho  } = useContext(CarrinhoContext)

    const {
        saldo,
        setSaldo
    } = useContext(UsuarioContext);
        
    const { formaPagamento } = usePagamentoContext();

    function mudarQuantidade(id, quantidade) {
        return carrinho.map(itemDoCarrinho => {
            if(itemDoCarrinho.id === id) itemDoCarrinho.quantidade += quantidade
            return itemDoCarrinho
        })
    }

    function adicionarProduto(novoProduto) {
        const temOProduto = carrinho.some(itemDoCarrinho => itemDoCarrinho.id === novoProduto.id)
    
        if(!temOProduto) { // se nao tem o produto, produto esta sendo inserido pela primeira vez
          novoProduto.quantidade = 1
          return setCarrinho(carrinhoAnterior =>
             [...carrinhoAnterior, novoProduto])
        }
        setCarrinho(mudarQuantidade(novoProduto.id, 1))
        
    }

      function removerProduto(id) {
        const produto = carrinho.find(itemDoCarrinho => itemDoCarrinho.id === id)
        const ehOUltimo  = produto.quantidade === 1
        if(ehOUltimo) {
            return setCarrinho(carrinhoAnterior => carrinhoAnterior.filter(itemDoCarrinho => 
                itemDoCarrinho.id !== id))
        }
        setCarrinho(mudarQuantidade(id, -1))
    }

    function comprar() {
        setCarrinho([]);
        setSaldo(saldo - valorTotalCarrinho);
      }

    useEffect(() => {

        let { novaQuantidade, novoTotal } = carrinho.reduce((contador, novoItem) => ({

            novaQuantidade: contador.novaQuantidade + novoItem.quantidade,
            novoTotal: contador.novoTotal + (novoItem.valor * novoItem.quantidade)

        }), { novaQuantidade: 0, novoTotal: 0 })

        setQuantidadeProdutos(novaQuantidade)
        setValorTotalCarrinho(novoTotal * formaPagamento.juros)

      }, [carrinho, formaPagamento, setQuantidadeProdutos, setValorTotalCarrinho])

    return {
        carrinho,
        setCarrinho,
        adicionarProduto, 
        removerProduto,
        quantidadeProdutos,
        setQuantidadeProdutos,
        valorTotalCarrinho, 
        comprar
    }
}