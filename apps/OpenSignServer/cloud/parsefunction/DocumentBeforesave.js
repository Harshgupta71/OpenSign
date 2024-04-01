async function DocumentBeforesave(request) {
  try {
    // below code is used to update document when user sent document or self signed
    const document = request.object;
    const oldDocument = request.original;

    // Check if SignedUrl field has been added (transition from undefined to defined)
    if (!oldDocument.get('SignedUrl') && document.get('SignedUrl')) {
      const SignedUrl = document.get('SignedUrl');

      // Update count in contracts_Users class
      const query = new Parse.Query('contracts_Users');
      query.equalTo('objectId', oldDocument.get('ExtUserPtr').id);

      try {
        const contractUser = await query.first({ useMasterKey: true });
        if (contractUser) {
          contractUser.increment('DocumentCount', 1);
          await contractUser.save(null, { useMasterKey: true });
        } else {
          // Create new entry if not found
          const ContractsUsers = Parse.Object.extend('contracts_users');
          const newContractUser = new ContractsUsers();
          newContractUser.set('DocumentCount', 1);
          await newContractUser.save(null, { useMasterKey: true });
        }
      } catch (error) {
        console.log('Error updating document count in contracts_users: ' + error.message);
      }
    }
  } catch (err) {
    console.log('err in document beforesave', err.message);
  }
}
export default DocumentBeforesave;
