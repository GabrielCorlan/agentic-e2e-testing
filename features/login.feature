Feature: Login
  As a registered customer
  I want to log in with my credentials
  So that I can access my account

  @UITC001 @smoke
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I fill in the email field
    And I fill in the password field
    And I click the login button
    Then I should be redirected to my account page
    And I should see the account menu for the logged-in user
