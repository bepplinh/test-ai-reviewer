
/**
 * Test service containing intentional bad practices and bugs
 * for AI PR Reviewer testing purposes.
 */

export class TestBuggyService {
  private readonly secretApiKey = "sk-proj-1234567890abcdef1234567890abcdef"; // Error: Hardcoded secret

  /**
   * Process data with various bad practices
   */
  public async processData(input: any): Promise<any> { // Error: Use of 'any' type
    console.log("Processing data starting...", input); // Error: Console log in production

    const results = [];
    
    // Error: Inefficient O(n^3) complexity
    for (let i = 0; i < input.length; i++) {
      for (let j = 0; j < input.length; j++) {
        for (let k = 0; k < input.length; k++) {
          if (input[i] === input[j] && input[j] === input[k]) {
            results.push(input[i]);
          }
        }
      }
    }

    // Error: Missing input validation for division by zero
    const average = results.length / (input.length - input.length); 
    
    // Error: Unreachable code after potential crash above, 
    // but also a redundant assignment
    let x = 10;
    x = 10;

    return {
      status: "success",
      data: results,
      val: average
    };
  }

  /**
   * Another bad function
   */
  private async fetchData() {
    // Error: Missing try-catch in async function
    const response = await fetch("http://insecure-api.com/data"); // Error: HTTP instead of HTTPS
    const data = await response.json();
    return data;
  }
}
