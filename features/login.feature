Feature: Login
  As a registered customer
  I want to log in with my credentials
  So that I can access my account

  @UITC001 @smoke
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I log in with valid credentials
    Then I should be redirected to my account page
    And I should see the account menu for the logged-in user
