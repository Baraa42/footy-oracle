Moralis.Cloud.job("fujiAddAccount", async (request) => {
  const { params, headers, log, message } = request;
  try {
    await addAccount(fuqiWeb3);
    message("Account added!");
  } catch (e) {
    message("Error occurred!");
    log.error(e.toString());
  }
});
