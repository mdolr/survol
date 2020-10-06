/* Hover classes bound themselves to a node
 */
class StackOverFlowHover {
    constructor(node, CURRENT_TAB) {
        this.boundNode = node;
        this.redirectLink = node.href;
        this.CURRENT_TAB = CURRENT_TAB;
        this.linkType = this.checkLinkType();
    }

    /* Description: This function is unique to every Hover class,
     * its goal is to get how many accepted answer are they .
     * it can also give the code of the accepted answer.
     */
    checkLinkType() {
        if (this.CURRENT_TAB != 'stackoverflow.com' && this.redirectLink.includes('/questions/')) {
 
            return 'stackoverflow';
        } else {
            return 'unknown';
        }
    }

    bindToContainer(node, domain, container) {

    
        if (this.linkType == 'stackoverflow') {
            window
                .survolBackgroundRequest(node.href,true)
                .then((res) => {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(res.data, 'text/html');
                    let answer_accepted = doc.getElementsByClassName('answer accepted-answer').length

                    let stackcontainer = document.createElement('div')
                    stackcontainer.className = "survol-wikipedia-container"

                    let webTitle = document.createElement('h1');
                    webTitle.appendChild(document.createTextNode(`${answer_accepted} Answer Accepted !`))

                    let code_div = document.createElement('div')
                    code_div.className = "code"

                    let textContainer = document.createElement('div');
                    textContainer.className = 'survol-wikipedia-text';

                    let text = document.createElement('p');
                    let code = document.createElement('code')
      
                    if(answer_accepted == 0){
                        let code_h = doc.getElementsByClassName('answer')[0].getElementsByTagName('pre')[0]
                        if(code_h.getElementsByTagName('code')[0].innerHTML){
                            let code_t = code_h.getElementsByTagName('code')[0].innerHTML
                            code.appendChild(document.createTextNode(code_t))
                        }
                    text.appendChild(document.createTextNode(doc.getElementsByClassName('s-prose js-post-body')[1].getElementsByTagName('p')[0].innerHTML.slice(0,100)))
                    
                    }else {
                        let code_h = doc.getElementsByClassName('answer accepted-answer')[0].getElementsByTagName('pre')[0]
                        if(code_h.getElementsByTagName('code')[0].innerHTML){
                            let code_t = code_h.getElementsByTagName('code')[0].innerHTML
                            code.appendChild(document.createTextNode(code_t))
                        }
                        text.appendChild(document.createTextNode(doc.getElementsByClassName('s-prose js-post-body')[1].getElementsByTagName('p')[0].innerHTML.slice(0,100)))
                        
                    }
                    code_div.appendChild(code)

                    textContainer.appendChild(webTitle);
                    textContainer.appendChild(text);
                    textContainer.appendChild(code_div)
                    
                    stackcontainer.appendChild(textContainer);
                    
                    
                    
                    container.appendChild(stackcontainer);

                   
                })
                .catch(console.error);
        }
    }
}