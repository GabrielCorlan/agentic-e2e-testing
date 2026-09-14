Feature: Login
  As a registered customer
  I want to log in with my credentials
  So that I can access my account

  @UITC001 @smoke
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I fill in the "email" field with my email
    And I fill in the "password" field with my password
    And I click the "login-submit" button
    Then I should be redirected to my account page
    And I should see the account menu for the logged-in user

  @UITC002 @regression
  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I fill in the "email" field with "nonexistent-user@example.com"
    And I fill in the "password" field with "WrongPassword123!"
    And I click the "login-submit" button
    Then I should see the "login-error" alert with message "Invalid email or password"
    And I should remain on the login page
