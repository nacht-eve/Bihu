const Bihu = artifacts.require('./Bihu.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Bihu', ([deployer, author, tipper]) => {
  let bihu

  before(async () => {
    bihu = await Bihu.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await bihu.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await bihu.name()
      assert.equal(name, 'Bihu')
    })
  })

  describe('posts', async () => {
    let result, postCount, result2

    before(async () => {
      result = await bihu.createQuestion('How to become a blockchain developer?', { from: author })
      postCount = await bihu.postCount()
      result2 = await bihu.createAnswer(postCount, 'Learn solidity programming', { from: author })
    })

    it('creates questions', async () => {
      // SUCESS
      assert.equal(postCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.question, 'How to become a blockchain developer?', 'question is correct')
      assert.equal(event.author, author, 'author is correct')

      await bihu.createQuestion('', { from: author }).should.be.rejected;
    })

    it('lists questions', async () => {
      const question = await bihu.questions(postCount)
      assert.equal(question.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(question.question, 'How to become a blockchain developer?', 'question is correct')
      assert.equal(question.ansCount, '1', 'number of answers is correct')
      assert.equal(question.author, author, 'author is correct')
    })

    it('lists answers', async () => {
      const answer = await bihu.getAnswer(postCount, postCount)
      assert.equal(answer[0].toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(answer[1], 'Learn solidity programming', 'answer is correct')
      assert.equal(answer[2], '0', 'number of answers is correct')
      assert.equal(answer[3], author, 'author is correct')
    })


    it('creates answers', async () => {
      // SUCESS
      assert.equal(postCount, 1)
      const event = result2.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.answer, 'Learn solidity programming', 'answer is correct')
      assert.equal(event.author, author, 'author is correct')

      await bihu.createQuestion('', { from: author }).should.be.rejected;
    })

    it('allows users to tip answers', async () => {
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await bihu.tipAnswer(postCount, postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipAmount
      tipAmount = web3.utils.toWei('1', 'Ether')
      tipAmount = new web3.utils.BN(tipAmount)

      const exepectedBalance = oldAuthorBalance.add(tipAmount)

      assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to tip a post that does not exist
      await bihu.tipAnswer(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })

  })
})
