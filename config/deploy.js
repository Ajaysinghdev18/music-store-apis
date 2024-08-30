document
  .querySelector(".enableEthereumButton")
  .addEventListener("click", async () => {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });

    try {
      const response = await axios.post(
        "https://api-eu1.tatum.io/v3/nft/deploy/",
        {
          name: "NEWONW",
          chain: "ETH",
          feeCurrency: "ETH",
          symbol: "NEW",
          signatureId: "b7ad58f7-d826-4db5-8a52-4f492935a7b4"
        },
        {
          headers: {
            "x-api-key": "951cabe04de143b98b75c4d4ed4d2d99"
          }
        }
      );

      const { signatureId } = response.data;

      const { data } = await axios.get(
        "https://api-eu1.tatum.io/v3/kms/" + signatureId,
        {
          headers: {
            "x-api-key": "951cabe04de143b98b75c4d4ed4d2d99"
          }
        }
      );

      const txConfig = JSON.parse(data.serializedTransaction);
      txConfig.from = accounts[0];
      txConfig.gasPrice = txConfig.gasPrice
        ? parseInt(txConfig.gasPrice).toString(16)
        : undefined;
      console.log(txConfig);
      console.log(
        await ethereum.request({
          method: "eth_sendTransaction",
          params: [txConfig]
        })
      );
    } catch (e) {
      console.error(e);
    }
  });
