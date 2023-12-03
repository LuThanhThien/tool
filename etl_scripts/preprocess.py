import pandas as pd
import re
from tqdm import tqdm
from config import *

# Read txt file
df_country = pd.DataFrame(columns = ["number", "country"])
df_nation = pd.DataFrame(columns = ["number", "nation"])

def data_getter(txt_path: str, csv_path: str, df: pd.DataFrame):
    pattern = r'<option value="(\d+)">(.+)</option>'
    with open(txt_path, "r", encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in tqdm(enumerate(lines), total=len(lines), desc="Processing"):
            match = re.match(pattern, line)
            if match:
                df.loc[i] = [match.group(1), match.group(2)]
    df.to_csv(csv_path, index=False)

data_getter(txt_country, csv_country, df_country)
data_getter(txt_nations, csv_nation, df_nation)


