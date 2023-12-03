import pandas as pd
from config import *
import argparse

def read_csv(file_path):   
   df = pd.read_csv(file_path, encoding='utf-8')
   return df

def write_csv(df, file_path):
   df.to_csv(file_path, index=False)


def country_to_number(country, df, keyword="country") -> int:
   result_row = df[df[keyword] == country]
   if not result_row.empty:
      return result_row.iloc[0]["number"]
   else:
      return None
   

def read_create(txt_path, df, nation_df, country_df):
   n = 0
   customer_line = 0
   with open(txt_path, "r", encoding='utf-8') as f:
      for line in f.readlines():
         if line == '\n':
            continue
         if customer_line == 0:
            name = line.strip()
            lastName = name.split()[0].strip()
            firstName = name.split(" ", maxsplit=1)[1].strip()
            df.loc[n, "firstName"] = firstName
            df.loc[n, "lastName"] = lastName
            # print("Customer name: " + firstName + " " + lastName)   
         elif customer_line == 1:
            dateBirth = line.strip().replace(".", "")
            df.loc[n, "dateBirth"] = dateBirth
            # print("Customer birthday (YYYY.MM.DD): ", dateBirth)
         elif customer_line == 2:
            gender = line.strip().split()[0].strip()
            nation = line.strip().split()[1].strip()
            country = nation
            df.loc[n, "gender"] = "F" if gender == "女性" else "M"
            df.loc[n, "nation"] = country_to_number(nation, nation_df, "nation")
            df.loc[n, "country"] = country_to_number(country, country_df, "country")
            # print("Customer gender: ", gender, "; Customer nation: ", nation)
         customer_line += 1
         if customer_line == 3:
            df.loc[n, "phoneNumberHash"] = "070-2210-6809"
            n += 1
            customer_line = 0
   return True if n > 0 else False


def customer_creator():
   df = pd.DataFrame(columns=["firstName", "lastName", "dateBirth", "gender", "nation", "country", "phoneNumberHash"])
   nation_df = read_csv(csv_nation)
   country_df = read_csv(csv_country)

   # num = country_to_number("アイスランド", country_df)
   # print(num)
   isCreated = read_create(txt_customers, df, nation_df, country_df)
   write_csv(df, csv_customers)
   
   return len(df) if isCreated else 0

if __name__ == "__main__":
   parser = argparse.ArgumentParser()
   parser.add_argument("--customer", action="store_true", help="Path to customers.txt")
   args = parser.parse_args()

   if args.customer:
      print("Creating customer table...")
      n = customer_creator()
      print("Add " + str(n) + " customers.")
   
